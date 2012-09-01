/**
 * Processing BEM.JSON.decl asynchronously
 *
 * @name BEM.JSON
*/
(function (BEM) {

    /**
     * Wait for resume before build inside block
     */
    BEM.JSON._ctx.prototype.wait = function () {
        this._threads = this._threads ? this._threads + 1 : 1;
        if (this._globalThread) {
            this._globalThread.count++;
        } else {
            throw new Error('Cant wait in synchronous build');
        }
    };

    BEM.JSON._ctx.prototype._buildBemSync = BEM.JSON._ctx.prototype._buildBem;

    BEM.JSON._ctx.prototype._buildBem = function () {
        if (this._threads === 0) {
            this._buildBemSync();
        }
    }

    /**
     * Resume building blocks
     */
    BEM.JSON._ctx.prototype.resume = function () {
        this._threads = Number(this._threads) - 1;
        if (this._globalThread) {
            this._globalThread.count--;
        } else {
            throw new Error('Cant resume in synchronous build');
        }
        this._buildBem();
        if(this._globalThread.count === 0) {
            this._globalThread.callback();
        }
    };

    BEM.JSON._ctx.prototype._buildWithNewCtx = function (params, pos, siblingsCount, currBlock, tParams) {
        var ctx = new BEM.JSON._ctx(
            params,
            pos,
            siblingsCount,
            currBlock,
            tParams
        );
        ctx._globalThread = this._globalThread;
        ctx._threads = 0;
        return ctx.build();
    };


    /**
     * Applies declarations to bemjson asynchronously
     *
     * @param {Object} param bemjson object
     * @param {Function} callback(resultParams) fires after all tree finished
     * @param {Function} callback().resultParams resulting bemjson object
     */
    BEM.JSON.buildAsync = function (params, callback) {
        var resultParams,
        thread = {
            count: 0,
            callback: function () {
                callback(resultParams);
            }
        },
        ctx = new BEM.JSON._ctx(params);
        ctx._globalThread = thread;
        ctx._threads = 0;
        resultParams = ctx.build();
        if (thread.count === 0) {
            thread.callback();
        }
    };

    /**
     * Applies declarations to bemjson synchronously
     *
     * @param {Object} param bemjson object
     * @return {Object} bemjson object
     */
    BEM.JSON.build = function (params) {
        var ctx = new BEM.JSON._ctx(params);
        ctx._threads = 0;
        return ctx.build();
    };

}(BEM));
