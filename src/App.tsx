import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ChildMainScreen } from './screens/ChildMainScreen';
import { ChildMainWarningScreen } from './screens/ChildMainWarningScreen';
import { ChildMainDangerScreen } from './screens/ChildMainDangerScreen';
import { ChildMainCriticalScreen } from './screens/ChildMainCriticalScreen';
import { DrumScreen } from './screens/DrumScreen';
import { DrumDangerScreen } from './screens/DrumDangerScreen';
import { MissionLogScreen } from './screens/MissionLogScreen';

import { AdminLoginScreen } from './screens/AdminLoginScreen';
import { AddEventScreen } from './screens/AddEventScreen';
import { AdminChestsScreen } from './screens/AdminChestsScreen';
import { AdminSettingsScreen } from './screens/AdminSettingsScreen';
import { AppProvider } from './store';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="mobile-container">
          <Routes>
          {/* Child Routes */}
          <Route path="/" element={<ChildMainScreen />} />
          <Route path="/warning" element={<ChildMainWarningScreen />} />
          <Route path="/danger" element={<ChildMainDangerScreen />} />
          <Route path="/critical" element={<ChildMainCriticalScreen />} />
          <Route path="/drum" element={<DrumScreen />} />
          <Route path="/drum2" element={<DrumDangerScreen />} />
          <Route path="/log" element={<MissionLogScreen />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLoginScreen />} />
          <Route path="/admin/event" element={<AddEventScreen />} />
          <Route path="/admin/chests" element={<AdminChestsScreen />} />
          <Route path="/admin/settings" element={<AdminSettingsScreen />} />
        </Routes>
      </div>
    </BrowserRouter>
  </AppProvider>
  );
}
