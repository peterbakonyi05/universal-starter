import { Request, Response } from 'express';

export function renderView(res: Response, view: string, viewModel: any = {}): Promise<string> {
    return new Promise((resolve, reject) => res.render(view, viewModel, (err, document) => {
        if (err) {
            reject(err);
            return;
        }
        resolve(document);
    }));
}

export function renderNgView(ngViewEngine: any, req: Request, document: string): Promise<string> {
    return new Promise((resolve, reject) => ngViewEngine('', { req, document } as any, (err, html) => {
        if (err) {
            reject(err);
            return;
        }
        resolve(html);
    }));
}
