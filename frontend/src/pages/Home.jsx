import HomeNew from '../components/Home/HomeNew';
import HomeUser from '../components/Home/HomeUser';

import { useAuth } from '../store/auth-context';

const Home = () => {

  const { user } = useAuth();

  return (
    <div>
      {!user ? (
        <HomeNew />
      ) : <HomeUser user={user} />}
    </div>
  );
};

export default Home;
