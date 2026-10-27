import { useEffect, useMemo, useState } from 'react';
import {
  getTalentRequest,
  markAsRead,
  updateTalentRequestStatus,
  sendTalentRequestShortlist,
  listMarketplaceCandidatesForAdmin,
  type TalentRequestItem,
  type AdminMarketplaceCandidateItem,
} from '../../api/admin.api';
import { resolveImageUrl } from '../../utils/imageUrl';
import './admin-talent-request-detail.css';

interface TalentRequestDetailPageProps {
  requestId: string;
  onBack: () => void;
  onBuildProject: () => void;
}

const statusTone: Record<string, string> = {
  pending_review: 'new',
  shortlisted_sent: 'discussion',
  candidate_selected: 'contacted',
  hire_started: 'contacted',
  approved: 'contacted',
  alternative_suggested: 'discussion',
  rejected: 'closed',
  hired: 'contacted',
  talent_hired: 'contacted',
};

const STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pending review',
  shortlisted_sent: 'Shortlist sent',
  candidate_selected: 'Candidate selected',
  hire_started: 'Hiring started',
  approved: 'Approved',
  alternative_suggested: 'Alternative suggested',
  rejected: 'Rejected',
  hired: 'Worker invited',
  talent_hired: 'Talent hired',
};

export default function TalentRequestDetailPage({
  requestId,
  onBack,
  onBuildProject,
}: TalentRequestDetailPageProps) {
  type ShortlistPreviewProfile = {
    workerId: string;
    workerName: string;
    workerRole: string;
    profilePhotoUrl: string;
    location: string;
    availabilityLabel: string;
  };

  const [request, setRequest] = useState<TalentRequestItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullPortfolio, setShowFullPortfolio] = useState(false);
  const [availableProfiles, setAvailableProfiles] = useState<AdminMarketplaceCandidateItem[]>([]);
  const [suggestedWorkerId, setSuggestedWorkerId] = useState('');
  const [selectedShortlistIds, setSelectedShortlistIds] = useState<string[]>([]);
  const [reviewNotes, setReviewNotes] = useState('');
  const [savingAction, setSavingAction] = useState('');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [debouncedCandidateSearch, setDebouncedCandidateSearch] = useState('');
  const [candidateAvailability, setCandidateAvailability] = useState('');
  const [candidateCountry, setCandidateCountry] = useState('');
  const [candidatePage, setCandidatePage] = useState(1);
  const [candidateTotal, setCandidateTotal] = useState(0);
  const [candidateCountries, setCandidateCountries] = useState<string[]>([]);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [editingShortlist, setEditingShortlist] = useState(false);
  const [showPreviousSends, setShowPreviousSends] = useState(false);
  const [historyPreview, setHistoryPreview] = useState<{
    title: string;
    sentAt?: string;
    note?: string;
    profiles: ShortlistPreviewProfile[];
  } | null>(null);

  useEffect(() => {
    if (!actionSuccess) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setActionSuccess('');
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [actionSuccess]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const detail = await getTalentRequest(requestId);
        await markAsRead(requestId);

        if (!active) {
          return;
        }

        setRequest({ ...detail, unread: false });
        setSuggestedWorkerId(detail.suggestedWorkerId ?? '');
        setSelectedShortlistIds(detail.shortlistedTalentProfiles?.map((profile) => profile.workerId) ?? []);
        setReviewNotes(detail.reviewNotes ?? '');
        setShowFullPortfolio(false);
        setActionSuccess('');
        // A new open-talent request should immediately show the live shortlist
        // preview and send controls. Sent shortlists retain their read-only tracker.
        setEditingShortlist(!detail.workerId && !detail.shortlistSentAt && !(detail.shortlistedTalentProfiles?.length) && !(detail.shortlistHistory?.length));
        setShowPreviousSends(false);
      } catch (err) {
        if (active) {
          setRequest(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [requestId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedCandidateSearch(candidateSearch);
    }, 220);

    return () => window.clearTimeout(timeoutId);
  }, [candidateSearch]);

  useEffect(() => {
    if (!requestId) {
      return;
    }

    let active = true;
    setCandidateLoading(true);

    listMarketplaceCandidatesForAdmin({
      requestId,
      q: debouncedCandidateSearch,
      availability: candidateAvailability,
      country: candidateCountry,
      page: candidatePage,
      perPage: 12,
    })
      .then((result) => {
        if (!active) return;
        setAvailableProfiles(result.items);
        setCandidateTotal(result.total);
        setCandidateCountries(result.filters.countries);
      })
      .catch(() => {
        if (!active) return;
        setCandidateCountries([]);
      })
      .finally(() => {
        if (active) {
          setCandidateLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [candidateAvailability, candidateCountry, candidatePage, debouncedCandidateSearch, requestId]);

  const handleStatusChange = async (status: string) => {
    if (!request) {
      return;
    }

    setSavingAction(status);
    setActionError('');
    setActionSuccess('');
    try {
      const updated = await updateTalentRequestStatus(request._id, {
        status,
        suggestedWorkerId: status === 'alternative_suggested' ? suggestedWorkerId : undefined,
        reviewNotes,
      });
      setRequest(updated);
      setSuggestedWorkerId(updated.suggestedWorkerId ?? '');
      setReviewNotes(updated.reviewNotes ?? '');
    } catch (err) {
      setActionError('We could not update this request right now. Please try again.');
    } finally {
      setSavingAction('');
    }
  };

  const handleSendShortlist = async () => {
    if (!request || selectedShortlistIds.length === 0) {
      return;
    }

    setSavingAction('shortlisted_sent');
    setActionError('');
    setActionSuccess('');
    try {
      const updated = await sendTalentRequestShortlist(request._id, {
        shortlistedWorkerIds: selectedShortlistIds,
        reviewNotes,
      });
      setRequest(updated);
      setSelectedShortlistIds(updated.shortlistedTalentProfiles?.map((profile) => profile.workerId) ?? selectedShortlistIds);
      setReviewNotes(updated.reviewNotes ?? '');
      setEditingShortlist(false);
      setActionSuccess(
        updated.status === 'shortlisted_sent' && request.status === 'shortlisted_sent'
          ? 'Updated shortlist email sent to the company successfully.'
          : 'Profiles were sent to the company email successfully.',
      );
    } catch (err) {
      setActionError('We could not send the shortlisted profiles. Please try again.');
    } finally {
      setSavingAction('');
    }
  };

  const formatDate = (value?: string) => (value ? new Date(value).toLocaleString() : 'Unknown');
  const formatStatus = (value?: string) => (value ? (STATUS_LABELS[value] ?? value.replace(/_/g, ' ')) : 'unknown');
  const getInitials = (name?: string) => {
    if (!name) {
      return 'NA';
    }

    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'NA';
  };
  const currentTone = statusTone[request?.status || ''] || 'new';
  const shortlistHistory = request?.shortlistHistory ?? [];
  const sentProfiles = request?.shortlistedTalentProfiles ?? [];
  const isShortlistFlowRequest = Boolean(
    request && (
      Boolean(request.shortlistSentAt)
      || sentProfiles.length > 0
      || shortlistHistory.length > 0
    ),
  );
  const isShortlistDraft = Boolean(request && !request.workerId && !isShortlistFlowRequest);
  const isGeneralRequest = Boolean(request && !request.workerId && !isShortlistFlowRequest);
  const isGeneralShortlistTracking = Boolean(
    isShortlistFlowRequest && request && ['shortlisted_sent', 'candidate_selected', 'hire_started', 'hired', 'talent_hired'].includes(request.status),
  );
  const isShortlistEditable = Boolean(request && request.status === 'shortlisted_sent');
  const showShortlistExperience = Boolean(request && (isShortlistFlowRequest || !request.workerId));
  const portfolioProjects = request?.talentProfile?.portfolioProjects ?? [];
  const servicePackages = request?.talentProfile?.servicePackages ?? [];
  const visiblePortfolioProjects = showFullPortfolio ? portfolioProjects : portfolioProjects.slice(0, 2);
  const suggestionCandidates = availableProfiles.filter((profile) => profile.workerId !== request?.workerId);
  const selectedProfiles = useMemo(() => {
    const sentProfiles = request?.shortlistedTalentProfiles ?? [];
    const byId = new Map<string, ShortlistPreviewProfile>();

    sentProfiles.forEach((profile) => {
      byId.set(profile.workerId, profile);
    });
    availableProfiles.forEach((profile) => {
      if (selectedShortlistIds.includes(profile.workerId)) {
        byId.set(profile.workerId, {
          workerId: profile.workerId,
          workerName: profile.name,
          workerRole: profile.role,
          profilePhotoUrl: profile.profilePhotoUrl,
          location: profile.location,
          availabilityLabel: profile.availabilityLabel,
        });
      }
    });

    return selectedShortlistIds
      .map((id) => byId.get(id))
      .filter(Boolean) as ShortlistPreviewProfile[];
  }, [availableProfiles, request?.shortlistedTalentProfiles, selectedShortlistIds]);
  const hasActiveChosenCandidate = Boolean(
    request
    && request.status !== 'shortlisted_sent'
    && request.workerId,
  );
  const activeChosenRequest = hasActiveChosenCandidate ? request : null;
  const selectedCandidateProfile = activeChosenRequest
    ? (activeChosenRequest.shortlistedTalentProfiles ?? []).find(
        (profile) => profile.workerId === activeChosenRequest.workerId,
      ) ?? null
    : null;
  const visibleSidebarProfiles = (isShortlistDraft || (isShortlistEditable && editingShortlist))
    ? selectedProfiles
      : isShortlistEditable
      ? sentProfiles
      : selectedCandidateProfile
        ? [
            selectedCandidateProfile,
            ...sentProfiles.filter((profile) => profile.workerId !== selectedCandidateProfile.workerId),
          ]
        : [];
  const sidebarPreviewProfiles = visibleSidebarProfiles.slice(0, 3);
  const hiddenSidebarCount = Math.max(0, visibleSidebarProfiles.length - sidebarPreviewProfiles.length);
  const latestShortlistHistory = shortlistHistory.length > 0 ? shortlistHistory[shortlistHistory.length - 1] : null;
  const previousShortlistHistory = shortlistHistory.length > 1 ? shortlistHistory.slice(0, -1).reverse() : [];
  const missingPreviousHistory = isGeneralShortlistTracking && Boolean(request?.shortlistSentAt) && shortlistHistory.length <= 1;

  const totalCandidatePages = Math.max(1, Math.ceil(candidateTotal / 12));
  const selectedCandidateTitle = request?.status === 'talent_hired'
    ? 'Hired candidate'
    : request?.status === 'hired'
      ? 'Invited candidate'
      : 'Selected candidate';
  const detailedCandidateTitle = request?.status === 'talent_hired'
    ? 'Hired candidate profile'
    : request?.status === 'hired'
      ? 'Invited candidate profile'
      : 'Chosen candidate profile';
  const canReopenShortlist = Boolean(request && isGeneralShortlistTracking && request.status !== 'talent_hired');
  const openShortlistEditor = () => {
    setSelectedShortlistIds(sentProfiles.map((profile) => profile.workerId));
    setEditingShortlist(true);
    setShowPreviousSends(false);
    setReviewNotes('');
    setActionError('');
    setActionSuccess('');
  };
  const closeShortlistEditor = () => {
    setSelectedShortlistIds(sentProfiles.map((profile) => profile.workerId));
    setEditingShortlist(false);
    setShowPreviousSends(false);
    setReviewNotes(request?.reviewNotes ?? '');
    setActionError('');
  };

  const trackerSteps = request ? [
    {
      label: 'Request received',
      description: 'Company submitted the hiring brief.',
      done: true,
      meta: formatDate(request.createdAt),
    },
    {
      label: 'Shortlist emailed',
      description: 'Dechub sent candidate profile links to the company email.',
      done: Boolean(request.shortlistSentAt),
      meta: request.shortlistSentAt ? formatDate(request.shortlistSentAt) : 'Waiting',
    },
    {
      label: 'Candidate selected',
      description: 'The company chose one shortlisted profile to continue hiring.',
      done: ['candidate_selected', 'hire_started', 'hired', 'talent_hired'].includes(request.status),
      meta: request.approvedAt ? formatDate(request.approvedAt) : 'Waiting for company action',
    },
    {
      label: 'Hiring started',
      description: 'The company entered the dashboard hiring flow for the chosen profile.',
      done: ['hire_started', 'hired', 'talent_hired'].includes(request.status),
      meta: ['hire_started', 'hired', 'talent_hired'].includes(request.status) ? 'In dashboard flow' : 'Not started yet',
    },
    {
      label: 'Worker invited',
      description: 'A worker invite was created from the dashboard.',
      done: ['hired', 'talent_hired'].includes(request.status),
      meta: request.hiredAt ? formatDate(request.hiredAt) : 'Not invited yet',
    },
    {
      label: 'Talent hired',
      description: 'The agreement is fully signed and the hire is complete.',
      done: request.status === 'talent_hired',
      meta: request.talentHiredAt ? formatDate(request.talentHiredAt) : 'Waiting for signed agreement',
    },
  ] : [];

  return (
    <div className="atd-root">
      <div className="atd-background" aria-hidden="true">
        <span className="atd-orb atd-orb-one" />
        <span className="atd-orb atd-orb-two" />
        <span className="atd-grid" />
      </div>

      <header className="atd-header">
        <button className="atd-back" onClick={onBack}>Back to requests</button>
        {!loading && request ? (
          <button
            className="atd-back"
            onClick={onBuildProject}
            disabled={!request.companyId}
            title={request.companyId ? 'Build the delivery team and project contract.' : 'The client must sign up with this request email first.'}
            style={!request.companyId ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
          >
            {request.companyId ? 'Build delivery project' : 'Build delivery project - client signup required'}
          </button>
        ) : null}
        {!loading && request ? (
          <div
            className="atd-header-meta"
            style={showShortlistExperience ? { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' } : undefined}
          >
            <div className="atd-header-card">
              <span>Request ID</span>
              <strong>{request._id}</strong>
            </div>
            <div className="atd-header-card">
              <span>Submitted date</span>
              <strong>{formatDate(request.createdAt)}</strong>
            </div>
            <div className="atd-header-card">
              <span>Request status</span>
              <strong className={`atd-header-status ${currentTone}`}>{formatStatus(request.status)}</strong>
            </div>
            {!showShortlistExperience ? (
              <div className="atd-header-card atd-header-card-select" style={{ minWidth: 320 }}>
              <label className="atd-select-label" htmlFor="atd-review-notes">Admin decision</label>
              <textarea
                id="atd-review-notes"
                value={reviewNotes}
                onChange={(event) => setReviewNotes(event.target.value)}
                placeholder="Optional note for the company"
                style={{ minHeight: 88, borderRadius: 16, border: '1px solid rgba(148, 163, 184, 0.35)', background: 'rgba(15, 23, 42, 0.22)', color: '#fff', padding: 12, resize: 'vertical' }}
              />
              <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                {isGeneralRequest ? (
                  <button
                    type="button"
                    className="atd-inline-button"
                    onClick={() => void handleSendShortlist()}
                    disabled={selectedShortlistIds.length === 0 || savingAction === 'shortlisted_sent'}
                  >
                    {savingAction === 'shortlisted_sent'
                      ? 'Sending shortlist...'
                      : isGeneralShortlistTracking
                        ? 'Resend profiles to company email'
                        : 'Send profiles to company email'}
                  </button>
                ) : (
                  <>
                    <button type="button" className="atd-inline-button" onClick={() => void handleStatusChange('approved')} disabled={savingAction === 'approved'}>
                      {savingAction === 'approved' ? 'Saving...' : 'Approve talent'}
                    </button>
                    <select
                      value={suggestedWorkerId}
                      onChange={(event) => setSuggestedWorkerId(event.target.value)}
                      style={{ borderRadius: 14, border: '1px solid rgba(148, 163, 184, 0.35)', background: 'rgba(15, 23, 42, 0.22)', color: '#fff', padding: 12 }}
                    >
                      <option value="">Select alternative profile</option>
                      {suggestionCandidates.map((profile) => (
                        <option key={profile.workerId} value={profile.workerId}>
                          {profile.name} - {profile.role}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="atd-inline-button"
                      onClick={() => void handleStatusChange('alternative_suggested')}
                      disabled={!suggestedWorkerId || savingAction === 'alternative_suggested'}
                    >
                      {savingAction === 'alternative_suggested' ? 'Saving...' : 'Suggest alternative'}
                    </button>
                  </>
                )}
                <button type="button" className="atd-inline-button" onClick={() => void handleStatusChange('rejected')} disabled={savingAction === 'rejected'}>
                  {savingAction === 'rejected' ? 'Saving...' : 'Reject request'}
                </button>
              </div>
              {actionError ? (
                <p className="atd-action-error">{actionError}</p>
              ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </header>

      {loading ? (
        <main className="atd-shell">
          <section className="atd-hero-card">
            <span className="atd-kicker">Loading request</span>
            <h1>Preparing premium detail view...</h1>
          </section>
        </main>
      ) : request ? (
        <main className="atd-shell">
          <section className="atd-grid-layout">
            <div className="atd-column">
              {!showShortlistExperience ? (
                <article className="atd-card">
                  <h2>Talent profile</h2>
                  <div className="atd-profile-top">
                    <div className="atd-talent-head">
                      {request.talentProfile?.profilePhotoUrl ? (
                        <img
                          className="atd-talent-photo"
                          src={request.talentProfile.profilePhotoUrl}
                          alt={request.workerName || 'Talent profile'}
                        />
                      ) : (
                        <div className="atd-talent-photo atd-talent-photo-fallback" aria-hidden="true">
                          {getInitials(request.workerName)}
                        </div>
                      )}
                    </div>
                    <div className="atd-info-grid atd-info-grid-profile">
                      <div>
                        <span>Name</span>
                        <strong>{request.workerName || 'Not provided'}</strong>
                      </div>
                      <div>
                        <span>Role</span>
                        <strong>{request.workerRole || 'Not provided'}</strong>
                      </div>
                      <div>
                        <span>Location</span>
                        <strong>{request.talentProfile?.location || 'Not provided'}</strong>
                      </div>
                      <div>
                        <span>Availability</span>
                        <strong>{request.talentProfile?.availabilityLabel || 'Not provided'}</strong>
                      </div>
                      <div>
                        <span>Phone number</span>
                        <strong>{request.talentProfile?.phone || 'Not provided'}</strong>
                      </div>
                      <div>
                        <span>Email</span>
                        <strong>{request.talentProfile?.email || 'Not provided'}</strong>
                      </div>
                      <div>
                        <span>Response time</span>
                        <strong>
                          {request.talentProfile?.responseTimeHours
                            ? `${request.talentProfile.responseTimeHours} hours`
                            : 'Not provided'}
                        </strong>
                      </div>
                    </div>
                  </div>
                  <div className="atd-talent-groups">
                    <div>
                      <span>Skills</span>
                      {request.talentProfile?.skills?.length ? (
                        <div className="atd-pill-list">
                          {request.talentProfile.skills.map((skill) => (
                            <span key={skill} className="atd-pill">{skill}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="atd-helper-copy">No skills added yet.</p>
                      )}
                    </div>
                    <div>
                      <span>Languages</span>
                      {request.talentProfile?.languages?.length ? (
                        <div className="atd-pill-list">
                          {request.talentProfile.languages.map((language) => (
                            <span key={language} className="atd-pill">{language}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="atd-helper-copy">No languages added yet.</p>
                      )}
                    </div>
                  </div>
                  <p className="atd-body-copy">
                    {request.talentProfile?.profileOverview || 'No talent overview provided.'}
                  </p>
                  <div className="atd-portfolio-section">
                    <div className="atd-section-head">
                      <h3>Service package pricing</h3>
                    </div>
                    {servicePackages.length ? (
                      <div className="atd-package-list">
                        {servicePackages.map((item) => {
                          const features = Array.isArray(item.features) ? item.features : [];

                          return (
                            <article key={`${item.name}-${item.price}`} className="atd-package-card">
                              <div className="atd-package-head">
                                <h4>{item.name}</h4>
                                <strong>${item.price.toLocaleString()}</strong>
                              </div>
                              <p>{item.description || 'No package description provided.'}</p>
                              <div className="atd-package-meta">
                                <span>{item.deliveryDays ? `${item.deliveryDays} day delivery` : 'Delivery not provided'}</span>
                                <span>{item.revisions !== null ? `${item.revisions} revisions` : 'Revisions not provided'}</span>
                              </div>
                              {features.length ? (
                                <div className="atd-pill-list">
                                  {features.map((feature) => (
                                    <span key={`${item.name}-${feature}`} className="atd-pill">{feature}</span>
                                  ))}
                                </div>
                              ) : (
                                <p className="atd-helper-copy">No package features added yet.</p>
                              )}
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="atd-helper-copy">Service package pricing has not been added yet.</p>
                    )}
                  </div>
                  <div className="atd-portfolio-section">
                    <div className="atd-section-head">
                      <h3>Portfolio projects</h3>
                      {portfolioProjects.length > 2 ? (
                        <button
                          type="button"
                          className="atd-inline-button"
                          onClick={() => setShowFullPortfolio((prev) => !prev)}
                        >
                          {showFullPortfolio ? 'Show fewer projects' : 'View full portfolio'}
                        </button>
                      ) : null}
                    </div>
                    {visiblePortfolioProjects.length ? (
                      <div className="atd-portfolio-list">
                        {visiblePortfolioProjects.map((project) => (
                          <article
                            key={`${project.title}-${project.imageUrl}-${project.description}`}
                            className="atd-portfolio-card"
                          >
                            {project.imageUrl ? (
                              <img
                                src={resolveImageUrl(project.imageUrl)}
                                alt={project.title}
                                className="atd-portfolio-image"
                              />
                            ) : null}
                            <div className="atd-portfolio-copy">
                              <h4>{project.title}</h4>
                              <p>{project.description}</p>
                              {project.tags.length ? (
                                <div className="atd-pill-list">
                                  {project.tags.map((tag) => (
                                    <span key={`${project.title}-${tag}`} className="atd-pill">{tag}</span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="atd-helper-copy">Portfolio projects have not been added yet.</p>
                    )}
                  </div>
                </article>
              ) : (
                <article className="atd-card">
                  <div className="atd-shortlist-layout">
                    {isGeneralShortlistTracking && !editingShortlist ? (
                      <div className="atd-shortlist-tracker">
                        <div className="atd-section-head" style={{ marginBottom: 18 }}>
                          <div>
                            <h2 style={{ margin: 0 }}>Company progress</h2>
                            <p className="atd-helper-copy" style={{ marginTop: 8 }}>
                              The shortlist has already been sent. Track what the company does next from this request.
                            </p>
                          </div>
                        </div>

                        <div className="atd-tracker-list">
                          {trackerSteps.map((step) => (
                            <div key={step.label} className={`atd-tracker-step ${step.done ? 'done' : ''}`}>
                              <div className="atd-tracker-dot" aria-hidden="true" />
                              <div>
                                <div className="atd-tracker-head">
                                  <strong>{step.label}</strong>
                                  <span>{step.meta}</span>
                                </div>
                                <p>{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {selectedCandidateProfile ? (
                          <div className="atd-selected-candidate-card">
                            <div className="atd-body-label">{selectedCandidateTitle}</div>
                            <div className="atd-selected-candidate-head">
                              <div>
                                <strong>{selectedCandidateProfile.workerName}</strong>
                                <p>{selectedCandidateProfile.workerRole}</p>
                              </div>
                              <button
                                type="button"
                                className="atd-inline-button"
                                onClick={() => window.open(`/marketplace/${encodeURIComponent(selectedCandidateProfile.workerId)}`, '_blank', 'noopener,noreferrer')}
                              >
                                Open selected profile
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div>
                        <div className="atd-section-head" style={{ marginBottom: 18 }}>
                          <div>
                            <h2 style={{ margin: 0 }}>{editingShortlist && !isShortlistDraft ? 'Update shortlist' : 'Shortlist candidates'}</h2>
                            <p className="atd-helper-copy" style={{ marginTop: 8 }}>
                              {editingShortlist && !isShortlistDraft
                                ? 'Add or remove marketplace profiles, then resend the updated shortlist to the company.'
                                : 'Start with the best matching marketplace profiles for this hiring brief, then refine with search and filters.'}
                            </p>
                          </div>
                          {editingShortlist && !isShortlistDraft ? (
                            <button
                              type="button"
                              className="atd-inline-button"
                              onClick={closeShortlistEditor}
                            >
                              Close
                            </button>
                          ) : null}
                        </div>

                      <div className="atd-shortlist-filters">
                        <input
                          value={candidateSearch}
                          onChange={(event) => {
                            setCandidateSearch(event.target.value);
                            setCandidatePage(1);
                          }}
                          placeholder="Search by role, skill, or region"
                          className="atd-shortlist-control"
                        />
                        <select
                          value={candidateAvailability}
                          onChange={(event) => {
                            setCandidateAvailability(event.target.value);
                            setCandidatePage(1);
                          }}
                          className="atd-shortlist-control"
                        >
                          <option value="">All availability</option>
                          <option value="available_now">Available now</option>
                          <option value="this_week">This week</option>
                          <option value="two_weeks">2 weeks notice</option>
                          <option value="next_month">Next month</option>
                        </select>
                        <select
                          value={candidateCountry}
                          onChange={(event) => {
                            setCandidateCountry(event.target.value);
                            setCandidatePage(1);
                          }}
                          className="atd-shortlist-control"
                        >
                          <option value="">All countries</option>
                          {candidateCountries.map((country) => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>

                      <div className="atd-shortlist-results">
                        {candidateLoading ? (
                          <div className="atd-shortlist-loading">Refreshing matches…</div>
                        ) : null}
                        {!candidateLoading && availableProfiles.length === 0 ? (
                          <p className="atd-helper-copy">No candidate profiles match these filters yet.</p>
                        ) : null}
                        {availableProfiles.map((profile) => {
                          const checked = selectedShortlistIds.includes(profile.workerId);
                          return (
                            <article
                              key={profile.workerId}
                              style={{
                                borderRadius: 20,
                                border: checked ? '1px solid rgba(73, 236, 197, 0.75)' : '1px solid rgba(148, 163, 184, 0.16)',
                                background: checked ? 'rgba(18, 52, 64, 0.9)' : 'rgba(15, 23, 42, 0.42)',
                                boxShadow: checked ? '0 0 0 1px rgba(73, 236, 197, 0.2)' : 'none',
                                padding: 18,
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: 14 }}>
                                  {profile.profilePhotoUrl ? (
                                    <img
                                      src={resolveImageUrl(profile.profilePhotoUrl)}
                                      alt={profile.name}
                                      style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.18)' }}
                                    />
                                  ) : (
                                    <div style={{ width: 54, height: 54, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 700 }}>
                                      {getInitials(profile.name)}
                                    </div>
                                  )}
                                  <div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{profile.name}</div>
                                    <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.76)', fontSize: 14 }}>{profile.role}</div>
                                    <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                      <span className="atd-pill">{profile.location}</span>
                                      <span className="atd-pill">{profile.availabilityLabel}</span>
                                      {profile.packagePrice > 0 ? (
                                        <span className="atd-pill">
                                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: profile.currency, maximumFractionDigits: 0 }).format(profile.packagePrice)}
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: 'grid', gap: 10 }}>
                                  <button
                                    type="button"
                                    className="atd-inline-button"
                                    onClick={() => window.open(`/marketplace/${encodeURIComponent(profile.workerId)}`, '_blank', 'noopener,noreferrer')}
                                  >
                                    View profile
                                  </button>
                                  <button
                                    type="button"
                                    className="atd-inline-button"
                                    style={{ background: checked ? '#49ecc5' : undefined, color: checked ? '#0f172a' : undefined }}
                                    onClick={() => {
                                      setSelectedShortlistIds((current) => (
                                        checked
                                          ? current.filter((id) => id !== profile.workerId)
                                          : Array.from(new Set([...current, profile.workerId]))
                                      ));
                                    }}
                                  >
                                    {checked ? 'Selected' : 'Select'}
                                  </button>
                                </div>
                              </div>
                              <p className="atd-body-copy" style={{ marginTop: 14 }}>
                                {profile.profileOverview || 'Marketplace overview not provided yet.'}
                              </p>
                              <div className="atd-pill-list">
                                {profile.skills.slice(0, 4).map((skill) => (
                                  <span key={`${profile.workerId}-${skill}`} className="atd-pill">{skill}</span>
                                ))}
                              </div>
                            </article>
                          );
                        })}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
                        <span className="atd-helper-copy">
                          Showing page {candidatePage} of {totalCandidatePages} · {candidateTotal} matched profiles
                        </span>
                        {totalCandidatePages > 1 ? (
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button
                            type="button"
                            className="atd-inline-button"
                            disabled={candidatePage <= 1}
                            onClick={() => setCandidatePage((current) => Math.max(1, current - 1))}
                          >
                            Previous
                          </button>
                          <button
                            type="button"
                            className="atd-inline-button"
                            disabled={candidatePage >= totalCandidatePages}
                            onClick={() => setCandidatePage((current) => Math.min(totalCandidatePages, current + 1))}
                          >
                            Next
                          </button>
                        </div>
                        ) : null}
                      </div>
                    </div>
                    )}

                    <aside className="atd-shortlist-sidebar">
                      <div className="atd-shortlist-sidebar-label">
                        {isShortlistEditable ? 'Profiles sent' : selectedCandidateProfile ? 'Chosen candidate' : 'Selected profiles'}
                      </div>
                      <div className="atd-shortlist-sidebar-count">{visibleSidebarProfiles.length}</div>
                      <p className="atd-helper-copy" style={{ marginTop: 8 }}>
                        {isShortlistEditable
                          ? 'This is the shortlist currently tied to the email flow for this request.'
                          : selectedCandidateProfile
                            ? 'This is the profile the company moved forward with from the shortlist.'
                            : 'These are the candidates that will be emailed to the company for review.'}
                      </p>

                      {actionSuccess ? (
                        <div className="atd-action-success">
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                            <span>{actionSuccess}</span>
                            <button
                              type="button"
                              className="atd-inline-button"
                              style={{ minWidth: 72, height: 32, fontSize: 12, padding: '0 12px' }}
                              onClick={() => setActionSuccess('')}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      ) : null}

                      <div className="atd-shortlist-sidebar-list">
                        {visibleSidebarProfiles.length === 0 ? (
                          <div className="atd-shortlist-sidebar-empty">
                            Select one or more matched profiles to build the shortlist.
                          </div>
                        ) : sidebarPreviewProfiles.map((profile) => {
                          const isChosen = hasActiveChosenCandidate && request.workerId === profile.workerId;
                          return (
                            <div key={profile.workerId} className={`atd-shortlist-sidebar-card ${isChosen ? 'chosen' : ''}`}>
                            <div style={{ fontWeight: 700, color: '#fff' }}>{profile.workerName}</div>
                            <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.72)', fontSize: 13 }}>{profile.workerRole}</div>
                            {request?.status !== 'shortlisted_sent' && isGeneralShortlistTracking && isChosen ? (
                              <div className="atd-shortlist-sidebar-badge">Chosen by company</div>
                            ) : null}
                            <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.56)', fontSize: 12 }}>{profile.location} · {profile.availabilityLabel}</div>
                          </div>
                          );
                        })}
                        {hiddenSidebarCount > 0 ? (
                          <div className="atd-shortlist-sidebar-more">
                            +{hiddenSidebarCount} more profiles in this shortlist
                          </div>
                        ) : null}
                        {hiddenSidebarCount > 0 ? (
                          <button
                            type="button"
                            className="atd-inline-button atd-shortlist-history-button"
                            onClick={() => {
                              setHistoryPreview({
                                title: 'Current shortlist',
                                sentAt: latestShortlistHistory?.sentAt ?? request?.shortlistSentAt ?? undefined,
                                note: latestShortlistHistory?.note ?? '',
                                profiles: visibleSidebarProfiles,
                              });
                            }}
                          >
                            Show all current profiles
                          </button>
                        ) : null}
                      </div>

                      {(previousShortlistHistory.length > 0 || missingPreviousHistory) && (
                        <div className="atd-shortlist-history">
                          <button
                            type="button"
                            className="atd-inline-button atd-shortlist-history-button"
                            onClick={() => setShowPreviousSends((current) => !current)}
                          >
                            {showPreviousSends ? 'Hide previous sent profiles' : 'Show previous sent profiles'}
                          </button>

                          {showPreviousSends ? (
                            <>
                              <div className="atd-shortlist-history-label">Previous sends</div>
                              {previousShortlistHistory.length > 0 ? (
                                <div className="atd-shortlist-history-list">
                                  {previousShortlistHistory.map((entry, index) => (
                                    <div key={`${entry.sentAt}-${index}`} className="atd-shortlist-history-card">
                                      <div className="atd-shortlist-history-head">
                                        <strong>{formatDate(entry.sentAt)}</strong>
                                        <span>{entry.profiles.length} profiles</span>
                                      </div>
                                      {entry.note?.trim() ? (
                                        <p>{entry.note}</p>
                                      ) : (
                                        <p>No note was included for this send.</p>
                                      )}
                                      <button
                                        type="button"
                                        className="atd-inline-button atd-shortlist-history-button"
                                        onClick={() => {
                                          setHistoryPreview({
                                            title: `Shortlist send ${previousShortlistHistory.length - index}`,
                                            sentAt: entry.sentAt,
                                            note: entry.note,
                                            profiles: entry.profiles,
                                          });
                                        }}
                                      >
                                        View profiles
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="atd-shortlist-sidebar-empty">
                                  Older sends were not stored for this request, so only the current shortlist can be shown here. New resend actions will now be preserved in history.
                                </div>
                              )}
                            </>
                          ) : null}
                        </div>
                      )}

                      {editingShortlist ? (
                      <div className="atd-shortlist-sidebar-actions">
                        <label className="atd-select-label" htmlFor="atd-sidebar-review-notes">Admin decision</label>
                        <textarea
                          id="atd-sidebar-review-notes"
                          value={reviewNotes}
                          onChange={(event) => setReviewNotes(event.target.value)}
                          placeholder="Optional note for the company"
                          className="atd-sidebar-textarea"
                        />
                        <button
                          type="button"
                          className="atd-inline-button atd-sidebar-button"
                          onClick={() => void handleSendShortlist()}
                          disabled={selectedShortlistIds.length === 0 || savingAction === 'shortlisted_sent'}
                        >
                          {savingAction === 'shortlisted_sent'
                            ? 'Sending shortlist...'
                            : isGeneralShortlistTracking
                              ? 'Resend profiles to company email'
                              : 'Send profiles to company email'}
                        </button>
                        {!isShortlistDraft ? (
                          <button
                            type="button"
                            className="atd-inline-button atd-sidebar-button"
                            onClick={closeShortlistEditor}
                          >
                            Close
                          </button>
                        ) : null}
                        {actionError ? (
                          <p className="atd-action-error">{actionError}</p>
                        ) : null}
                      </div>
                      ) : canReopenShortlist ? (
                      <div className="atd-shortlist-sidebar-actions">
                          <button
                            type="button"
                            className="atd-inline-button atd-sidebar-button"
                            onClick={openShortlistEditor}
                          >
                            Add or update profiles
                          </button>
                        {actionError ? (
                          <p className="atd-action-error">{actionError}</p>
                        ) : null}
                      </div>
                      ) : null}
                    </aside>
                  </div>
                </article>
              )}

              {isGeneralShortlistTracking && selectedCandidateProfile && request.talentProfile ? (
                <article className="atd-card">
                  <h2>{detailedCandidateTitle}</h2>
                  <div className="atd-profile-top">
                    <div className="atd-talent-head">
                      {request.talentProfile.profilePhotoUrl ? (
                        <img
                          className="atd-talent-photo"
                          src={request.talentProfile.profilePhotoUrl}
                          alt={selectedCandidateProfile.workerName || 'Selected candidate'}
                        />
                      ) : (
                        <div className="atd-talent-photo atd-talent-photo-fallback" aria-hidden="true">
                          {getInitials(selectedCandidateProfile.workerName)}
                        </div>
                      )}
                    </div>
                    <div className="atd-info-grid atd-info-grid-profile">
                      <div>
                        <span>Name</span>
                        <strong>{selectedCandidateProfile.workerName || 'Not provided'}</strong>
                      </div>
                      <div>
                        <span>Role</span>
                        <strong>{selectedCandidateProfile.workerRole || 'Not provided'}</strong>
                      </div>
                      <div>
                        <span>Location</span>
                        <strong>{request.talentProfile.location || 'Not provided'}</strong>
                      </div>
                      <div>
                        <span>Availability</span>
                        <strong>{request.talentProfile.availabilityLabel || 'Not provided'}</strong>
                      </div>
                      <div>
                        <span>Phone number</span>
                        <strong>{request.talentProfile.phone || 'Not provided'}</strong>
                      </div>
                      <div>
                        <span>Email</span>
                        <strong>{request.talentProfile.email || 'Not provided'}</strong>
                      </div>
                      <div>
                        <span>Response time</span>
                        <strong>
                          {request.talentProfile.responseTimeHours
                            ? `${request.talentProfile.responseTimeHours} hours`
                            : 'Not provided'}
                        </strong>
                      </div>
                    </div>
                  </div>
                  <div className="atd-talent-groups">
                    <div>
                      <span>Skills</span>
                      {request.talentProfile.skills?.length ? (
                        <div className="atd-pill-list">
                          {request.talentProfile.skills.map((skill) => (
                            <span key={skill} className="atd-pill">{skill}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="atd-helper-copy">No skills added yet.</p>
                      )}
                    </div>
                    <div>
                      <span>Languages</span>
                      {request.talentProfile.languages?.length ? (
                        <div className="atd-pill-list">
                          {request.talentProfile.languages.map((language) => (
                            <span key={language} className="atd-pill">{language}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="atd-helper-copy">No languages added yet.</p>
                      )}
                    </div>
                  </div>
                  <p className="atd-body-copy">
                    {request.talentProfile.profileOverview || 'No profile overview provided yet.'}
                  </p>
                </article>
              ) : null}

              <article className="atd-card">
                <h2>Project brief</h2>
                <div className="atd-info-grid">
                  <div>
                    <span>Project type</span>
                    <strong>{request.projectType || 'Not provided'}</strong>
                  </div>
                </div>
                <div className="atd-body-label">Project description</div>
                <p className="atd-body-copy">
                  {request.projectDescription || 'No project description provided.'}
                </p>
              </article>

              <article className="atd-card">
                <h2>Company contact</h2>
                <div className="atd-info-grid">
                  <div>
                    <span>Company Name</span>
                    <strong>{request.companyName}</strong>
                  </div>
                  <div>
                    <span>Website</span>
                    <strong>{request.companyWebsite || 'Not provided'}</strong>
                  </div>
                  <div>
                    <span>Contact person</span>
                    <strong>{request.contactFirstName} {request.contactLastName}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{request.email}</strong>
                  </div>
                  <div>
                    <span>Phone</span>
                    <strong>{request.phoneNumber || 'Not provided'}</strong>
                  </div>
                </div>
              </article>

              {request.suggestedTalentProfile ? (
                <article className="atd-card">
                  <h2>Suggested profile</h2>
                  <div className="atd-info-grid">
                    <div>
                      <span>Name</span>
                      <strong>{request.suggestedTalentProfile.workerName}</strong>
                    </div>
                    <div>
                      <span>Role</span>
                      <strong>{request.suggestedTalentProfile.workerRole}</strong>
                    </div>
                    <div>
                      <span>Location</span>
                      <strong>{request.suggestedTalentProfile.location}</strong>
                    </div>
                    <div>
                      <span>Availability</span>
                      <strong>{request.suggestedTalentProfile.availabilityLabel}</strong>
                    </div>
                  </div>
                </article>
              ) : null}
            </div>
          </section>
        </main>
      ) : (
        <main className="atd-shell">
          <section className="atd-hero-card">
            <span className="atd-kicker">Request unavailable</span>
            <h1>We couldn&apos;t load this request.</h1>
            <p>Try going back to the request stream and opening it again.</p>
          </section>
        </main>
      )}

      {historyPreview ? (
        <div className="atd-history-modal" role="dialog" aria-modal="true" aria-label={historyPreview.title}>
          <div className="atd-history-modal-card">
            <div className="atd-history-modal-head">
              <div>
                <div className="atd-shortlist-history-label">Shortlist history</div>
                <h2>{historyPreview.title}</h2>
                <p className="atd-helper-copy" style={{ marginTop: 8 }}>
                  {historyPreview.sentAt ? formatDate(historyPreview.sentAt) : 'Sent time unavailable'} · {historyPreview.profiles.length} profiles
                </p>
                {historyPreview.note?.trim() ? (
                  <p className="atd-history-modal-note">{historyPreview.note}</p>
                ) : null}
              </div>
              <button
                type="button"
                className="atd-inline-button atd-history-modal-close"
                onClick={() => setHistoryPreview(null)}
              >
                Close
              </button>
            </div>

            <div className="atd-history-modal-grid">
              {historyPreview.profiles.map((profile) => {
                const isChosen = hasActiveChosenCandidate && request?.workerId === profile.workerId;
                return (
                  <div key={`${historyPreview.title}-${profile.workerId}`} className={`atd-shortlist-sidebar-card ${isChosen ? 'chosen' : ''}`}>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{profile.workerName}</div>
                    <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.72)', fontSize: 13 }}>{profile.workerRole}</div>
                    {isChosen ? (
                      <div className="atd-shortlist-sidebar-badge">Chosen by company</div>
                    ) : null}
                    <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.56)', fontSize: 12 }}>
                      {profile.location} · {profile.availabilityLabel}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
