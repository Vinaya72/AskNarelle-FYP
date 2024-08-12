import { msalInstance } from "@/app/_app";

export default function SignOutButton() {
  const handleLogout = (logoutType: string) => {
    if (logoutType === "popup") {
      msalInstance.logoutPopup().catch((e) => {
        console.error(`logoutPopup failed: ${e}`);
      });
    } else if (logoutType === "redirect") {
      msalInstance.logoutRedirect().catch((e) => {
        console.error(`logoutRedirect failed: ${e}`);
      });
    }
  };

  return (
      <button
        className="bg-[#FF5C5C] hover:bg-[#FF8A8A] text-white font-semibold font-nunito rounded px-4 py-2 transition duration-300 transform hover:scale-105"
        onClick={() => handleLogout("popup")}
      >
        Log Out
      </button>
  );
}
