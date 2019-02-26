import React from 'react'
import * as THREE from 'three'
import * as controls from 'three-orbit-controls';
const OrbitControls = controls(THREE)
//import {TextureLoader} from './threejs/src/loaders/TextureLoader.js'
//import {Mesh} from './threejs/src/objects/Mesh'
//import {PerspectiveCamera} from './threejs/src/cameras/PerspectiveCamera.js'
//import {Color} from './threejs/src/math/Color.js'
//import {JSONLoader} from './threejs/src/loaders/JSONLoader.js'
//import {ShaderMaterial} from './threejs/src/materials/ShaderMaterial'
//import {AmbientLight} from './threejs/src/lights/AmbientLight'
//import {Scene} from './threejs/src/scenes/Scene.js'
import Renderer from './Renderer'
//

import {vertShader} from './threejs/vertShader.js'
import {fragShader} from './threejs/fragShader.js'

import Hls from "hls.js";
/**
 * Implements a 3D scene
 *
 * Functions of this class are to be passed as callbacks to Renderer.
 *
 * Parameters passed to every function are: 
 *
 * - renderer: Three.js WebGLRenderer object
 *     (https://threejs.org/docs/#api/renderers/WebGLRenderer)
 *
 * - gl: WebGLRenderingContext of the underlying canvas element
 *     (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext)
 */
export default class Scene extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      rotationDirection: +1,   // shows which direction cube spins
    }
    this.cameraNames = ['a','b','c']
    this.start = Date.now()
    this.scene = new THREE.Scene()
    this.videoA = []
    this.videoB = []
    this.counter = []
    for(let i=0; i<3; i++){
      this.videoA[i] = React.createRef();
      this.videoB[i] = React.createRef();
      this.counter[i] = 0
    }
  }


  onResize = (renderer, gl, { width, height }) => {
    // This function is called after canvas has been resized.

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  initScene = (renderer, gl) => {
    let anisomax = renderer.capabilities.getMaxAnisotropy();

    let data = new Uint8Array(1024 * 1024 * 3);
    data.fill(100)

    this.geometry = []
    this.mesh = []
    this.material = []
    this.texture = []

    for(let i=0; i<3;i++){
      this.texture = new THREE.VideoTexture( this.videoA[0].current );
      this.material = new THREE.MeshBasicMaterial( { map: this.texture } );
      this.geometry[i] = new THREE.CylinderGeometry(15, 15, 20, 32, 1, true,i*2*Math.PI/3, 2*Math.PI/3) 
      this.geometry[i].scale( - 1, 1, 1 );
      this.mesh[i] = new THREE.Mesh( this.geometry[i], this.material );
      this.mesh[i].position.set(0,0,0)
      this.scene.add(this.mesh[i])
    }

    const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
    this.scene.add(ambientLight)

    this.scene.background = new THREE.Color( 0x000000 )

    this.camera            = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000)
    this.controls = new OrbitControls(this.camera,renderer.domElement);
    this.camera.position.z = 4

    renderer.setClearColor('#0d0d1e')
  }

  renderScene = (renderer, gl) => {
    this.controls.update()
    renderer.render(this.scene, this.camera)
  }

  handleDirectionButtonClick = () => {
    // Flip rotation direction sign
    this.setState({
      rotationDirection: this.state.rotationDirection * -1,
    })
  }

  ended = (current,next,key) => {
    this.counter[key] ++
    next.src = `https://res.cloudinary.com/cactice/video/upload/v1550364356/dog/c/${this.counter[key]}.mov`
    this.texture[key] = new THREE.VideoTexture( current );
    this.mesh[key].material.map = this.texture[key]
    this.mesh[key].material.needsUpdate = true;
    current.play();
  }

  onEndedA = (key) => {
    this.ended(this.videoB[key].current,this.videoA[key].current,key)
  }
  
  onEndedB = (key) => {
    this.ended(this.videoA[key].current,this.videoB[key].current,key)
  }

  componentDidMount(){
    for(let i=0; i<3; i++){
      let video = this.videoA[i].current
      video.crossOrigin = "anonymous";
      video.src = `https://res.cloudinary.com/cactice/video/upload/v1550364356/dog/c/${this.counter[i]}.mov`
      this.counter[i]++
      let video2 = this.videoB[i].current
      video2.crossOrigin = "anonymous";
      video2.src = `https://res.cloudinary.com/cactice/video/upload/v1550364356/dog/c/${this.counter[i]}.mov`
      video.play()
    }
  }

  render = () => {
    return (
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-12'>
            <div className="row" >
              {this.cameraNames.map((name,key)=>{ 
                let onEndedA = () => this.onEndedA(key)
                let onEndedB = () => this.onEndedB(key)
                return (
                  <div key={key}>
                    <video key={'a'+key} ref={this.videoA[key]} onEnded={onEndedA} style={{display: `none`}} muted/>
                    <video key={'b'+key} ref={this.videoB[key]} onEnded={onEndedB} style={{display: `none`}} muted/>
                  </div>
                )
              })
              }
              <Renderer
                onResize    = {this.onResize}
                initScene   = {this.initScene}
                renderScene = {this.renderScene}
              />
            </div>
          </div>
        </div>
        <style jsx>{`
          .container-fluid {
            width : 100vw;
            height: 100vh;
          }

          .row {
            height: 100vh;
          }
        `}</style>
      </div>
    )
  }
  
}



