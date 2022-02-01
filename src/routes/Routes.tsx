import { Route, Routes as RoutesImport } from "react-router-dom";
import MintPage from "components/pages/MintPage";

export default function Routes(): JSX.Element {
  return (
    <RoutesImport>
      <Route path="/" element={<MintPage />} />
    </RoutesImport>
  );
}
