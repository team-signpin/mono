import {observer} from 'mobx-react';
import {useAppState} from './comps/StateContext';
import Home from './comps/Home';
import {Switch, Route} from 'react-router-dom';
import Dashboard from './comps/Dashboard';
import Add from './comps/Add';
import Verify from './comps/Verify';

const App = observer(() => {
    const auth = useAppState('auth');
    // const loggedIn = auth.isLoggedIn;
    const loggedIn = true;

    return (
        <Switch>
            <Route path={'/login'} render={() => <Home />} />
            <Route path={'/register'} render={() => <Home />} />

            <Route path={'/add'} render={() => <Add />} />
            <Route path={'/verify'} render={() => <Verify />} />

            <Route
                path={'/'}
                render={() => (loggedIn ? <Dashboard /> : <Home />)}
            />
        </Switch>
    );
});

export default App;
