import { getInitials } from "../lib/queue";

export function AvatarContent({ profile }) {
  return profile.avatar
    ? <img className="avatar-photo" src={profile.avatar} alt="" />
    : getInitials(profile.name);
}

export function Brand() {
  return (
    <div className="brand" aria-label="QueueLess SA">
      <span className="brand-mark"><span>Q</span></span>
      <span className="brand-name">QueueLess <b>SA</b></span>
    </div>
  );
}

export function IconButton({ label, children, className = "", ...props }) {
  return (
    <button className={`icon-button ${className}`} aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}
