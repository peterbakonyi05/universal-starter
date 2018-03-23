import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import { enableProdMode } from '@angular/core';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
import { Router } from 'express';

import { renderView, renderNgView } from '../utils/view';

import { AppRouterOptions } from './app-router.model';

export function createAppRouter({ scripts, styles }: AppRouterOptions): Router {
    const router = Router();
    const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('../../../dist/server/main.bundle');

    enableProdMode();

    const ngViewEngine = ngExpressEngine({
        bootstrap: AppServerModuleNgFactory,
        providers: [
            provideModuleMap(LAZY_MODULE_MAP)
        ]
    });

    router.get('*', (req, res) => {
        renderView(res, 'index', { scripts, styles })
            .then(document => renderNgView(ngViewEngine, req, document))
            .then(document => res.send(document))
            .catch(err => {
                console.log(err);
                res.redirect('500');
            });
    });

    return router;
}
