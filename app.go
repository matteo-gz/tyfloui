package main

import (
	"context"
	"fmt"
	"log"

	"github.com/matteo-gz/tyflo/pkg/tunnel"
)

// App struct
type App struct {
	ctx       context.Context
	sshTunnel tunnel.SshI
	sshCtx    context.Context
	cancel    context.CancelFunc
	status    bool
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

type Test1Result struct {
	Ok      bool
	Message string
}

func (a *App) Test1() Test1Result {
	return Test1Result{Ok: true, Message: "success"}
}

type StartProxyResult struct {
	Ok      bool
	Message string
}

func (a *App) GetStatus() bool {
	return a.status
}

func (a *App) StartProxy(file string, host string, port int, user string, socks5Port int) StartProxyResult {
	if a.sshTunnel != nil {
		a.StopProxy()
		log.Println("ssh隧道已启动，先关闭")
	}
	a.sshTunnel = tunnel.NewSshTunnel()
	a.sshCtx, a.cancel = context.WithCancel(context.Background())
	err := a.sshTunnel.ConnectByPrivateKey(a.sshCtx, file, user, host, port)
	log.Println("ssh连接成功", err)
	if err != nil {
		log.Println("ssh连接失败", err)
		return StartProxyResult{Ok: false, Message: err.Error()}
	}
	err = a.sshTunnel.Start(socks5Port)
	if err != nil {
		log.Println("ssh隧道启动失败", err)
		return StartProxyResult{Ok: false, Message: err.Error()}
	}
	log.Println("socks5-ssh隧道启动成功")
	a.status = true
	return StartProxyResult{Ok: true, Message: "success"}
}

type StopProxyResult struct {
	Ok      bool
	Message string
}

func (a *App) StopProxy() StopProxyResult {
	if a.sshTunnel == nil {
		log.Println("sshTunnel is nil")
		return StopProxyResult{Ok: false, Message: "sshTunnel is nil"}
	}
	a.cancel()
	err := a.sshTunnel.Close()
	if err != nil {
		log.Println("ssh隧道关闭失败", err)
		return StopProxyResult{Ok: false, Message: err.Error()}
	}
	log.Println("ssh隧道关闭成功")
	a.status = false
	return StopProxyResult{Ok: true, Message: "success"}
}
