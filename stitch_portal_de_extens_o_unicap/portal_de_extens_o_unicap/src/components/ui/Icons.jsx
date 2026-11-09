import PropTypes from "prop-types";

// Conteúdo SVG de cada ícone (Material Symbols). A fábrica `createIcon`
// evita dezenas de wrappers duplicados; a API de named exports é mantida.
const ICON_CONTENT = {
  CheckCircle: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />,
  Pending: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />,
  Mail: <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />,

  AlertTriangle: <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />,
  Calendar: <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />,
  Clock: <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />,
  User: <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />,
  Building: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  MapPin: <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />,
  School: (
    <>
      <path d="M12 3L1 9l11 6 9-4.91V17h2V9M4 17v2h16v-2" />
      <circle cx="12" cy="9" r="2" />
    </>
  ),
  Attachment: <path d="M21.44 11.05l-9.18 9.18a6 6 0 0 1-8.49-8.49l9.18-9.17a4 4 0 0 1 5.66 5.66l-9.17 9.18a2 2 0 0 1-2.83-2.83l8.49-8.48-8.49-8.48a2 2 0 0 1-2.83-2.83l9.17-9.17a4 4 0 0 1 5.66 5.66l-9.18 9.17a6 6 0 0 1-2.07 4.56z" />,
  Logout: (
    <>
      <path d="M10.09 15.59L11.5 17l5-5-5-5L10.09 9l5 5z" />
      <path d="M16.5 12.28l-5-5 5-5 1.41 1.41L11.5 8.17l4.59 4.58z" />
    </>
  ),
  Settings: <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L3.16 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.08-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />,
  Save: <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />,

  ArrowForward: <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />,
  ArrowBack: <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />,
  Check: <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />,
  Close: <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />,

  Search: <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />,
  Filter: <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm4 7h10v-1H7v1z" />,
  Sort: <path d="M3 18h6v-2H3v2zm0-5h9v-2H3v2zm0-7v2h18V6H3z" />,
  FileText: <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />,

  Download: <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />,
  Plus: <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />,

  Eye: <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />,
  EyeOff: <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.36 2.36C10.74 7.13 11.35 7 12 7zM2 4.27l2.34 2.34c.39.39 1.02.39 1.41 0l3.27-3.27c.39-.39.39-1.02 0-1.41L7.19 2.86c-.39-.39-1.02-.39-1.41 0L2 4.27zM21.99 4.27l-2.34 2.34c-.39.39-.39 1.02 0 1.41l3.27 3.27c.39.39 1.02.39 1.41 0l3.27-3.27c.39-.39.39-1.02 0-1.41l3.27-3.27c.39-.39.39-1.02 0-1.41l-3.27-3.27c-.39-.39-1.02-.39-1.41 0L2 4.27z" />,
  Shield: <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />,
  Lock: <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />,
  LockOpen: (
    <>
      <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9c0 1.1-.9 2-2 2h-2c-1.1 0-2-.9-2-2 0-.66.25-1.26.68-1.73L19 5c.83-.83 1.26-1.93.97-3H16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v1c0 1.66.67 3.16 1.75 4.25L10 16c0 1.1.9 2 2 2h2c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2h-1v2h1c1.66 0 3-1.34 3-3v-3c0-1.1-.9-2-2-2h-2zM4 6h16v10H4V6zm1 1H3V7h2v2zM21 7h-2V6h2v1z" />
    </>
  ),

};

// Aliases: ícones que compartilham o mesmo desenho.
ICON_CONTENT.ErrorIcon = ICON_CONTENT.Pending;
ICON_CONTENT.CalendarMonth = ICON_CONTENT.Calendar;
ICON_CONTENT.Schedule = ICON_CONTENT.Clock;
ICON_CONTENT.Person = ICON_CONTENT.User;
ICON_CONTENT.Help = ICON_CONTENT.Info;
ICON_CONTENT.Print = ICON_CONTENT.Report;

function createIcon(name, defaultColor = "") {
  function Icon({ className = "w-5 h-5", color = defaultColor }) {
    return (
      <svg
        className={`${className} ${color}`}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        {ICON_CONTENT[name]}
      </svg>
    );
  }

  Icon.propTypes = {
    className: PropTypes.string,
    color: PropTypes.string
  };
  return Icon;
}

export const CheckCircle = createIcon("CheckCircle");
export const Pending = createIcon("Pending");
export const Mail = createIcon("Mail");
export const ErrorIcon = createIcon("ErrorIcon");

export const AlertTriangle = createIcon("AlertTriangle");
export const Calendar = createIcon("Calendar");
export const Clock = createIcon("Clock");
export const User = createIcon("User");
export const Building = createIcon("Building");
export const CalendarMonth = createIcon("CalendarMonth");
export const MapPin = createIcon("MapPin");
export const School = createIcon("School");
export const Schedule = createIcon("Schedule");
export const Attachment = createIcon("Attachment");
export const Logout = createIcon("Logout");
export const Settings = createIcon("Settings");
export const Save = createIcon("Save");
export const Person = createIcon("Person");

export const ArrowForward = createIcon("ArrowForward");
export const ArrowBack = createIcon("ArrowBack");
export const Check = createIcon("Check");
export const Close = createIcon("Close");

export const Search = createIcon("Search");
export const Filter = createIcon("Filter");
export const Sort = createIcon("Sort");

export const FileText = createIcon("FileText");

export const Download = createIcon("Download");
export const Plus = createIcon("Plus");

export const Eye = createIcon("Eye");
export const EyeOff = createIcon("EyeOff");
export const Shield = createIcon("Shield");
export const Lock = createIcon("Lock");
export const LockOpen = createIcon("LockOpen");

export const Verified = createIcon("CheckCircle", "text-green-600");
