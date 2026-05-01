import TranslationPage from '@/features/Translation/TranslationPage';
import UploadPage from '@/features/Upload/UploadPage';
import PrivateRoute from '@/app/router/PrivateRoute';
import UnknownPage from '@/shared/page/Error/UnkownPage';
import ValueCatalogsPage from '@/shared/page/ValueCatalogsPage';
import ValueSetsPage from '@/shared/page/ValueSetsPage';
import { Routes, Route } from 'react-router';

function Router() {
  return (
    <Routes>
      <Route
        path='/incarcare'
        element={
          <PrivateRoute requiredRoles={['administrator']}>
            <UploadPage />
          </PrivateRoute>
        }
      />

      <Route path='/traduceri' element={<ValueCatalogsPage />} />
      <Route path='/traduceri/:versionId' element={<ValueSetsPage />} />
      <Route path='/traduceri/:versionId/:valueSetId' element={<TranslationPage />} />
      <Route path='*' element={<UnknownPage />} />
    </Routes>
  );
}

export default Router;
