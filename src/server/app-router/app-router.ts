import { Router } from 'express';

import { renderView } from '../utils/view';

import { AppRouterOptions } from './app-router.model';

export function createAppRouter({ scripts, styles }: AppRouterOptions): Router {
    const router = Router();

    router.get('*', (req, res) => {
        renderView(res, 'index', { scripts, styles })
            .then(document => res.send(document))
            .catch(err => {
                console.log(err);
                res.redirect('500');
            });
    });

    return router;
}
