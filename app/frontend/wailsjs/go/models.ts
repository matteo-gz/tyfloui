export namespace main {
	
	export class StartProxyResult {
	    Ok: boolean;
	    Message: string;
	
	    static createFrom(source: any = {}) {
	        return new StartProxyResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Ok = source["Ok"];
	        this.Message = source["Message"];
	    }
	}
	export class StopProxyResult {
	    Ok: boolean;
	    Message: string;
	
	    static createFrom(source: any = {}) {
	        return new StopProxyResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Ok = source["Ok"];
	        this.Message = source["Message"];
	    }
	}
	export class Test1Result {
	    Ok: boolean;
	    Message: string;
	
	    static createFrom(source: any = {}) {
	        return new Test1Result(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Ok = source["Ok"];
	        this.Message = source["Message"];
	    }
	}

}

