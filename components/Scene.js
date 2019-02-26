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
    this.start = Date.now()
    this.scene = new THREE.Scene()
    this.videoA = React.createRef();
    this.videoB = React.createRef();
    this.counter = 0

  }


  onResize = (renderer, gl, { width, height }) => {
    // This function is called after canvas has been resized.

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  initScene = (renderer, gl) => {
    let anisomax = renderer.capabilities.getMaxAnisotropy();
    this.texture = new THREE.VideoTexture( this.videoA.current );
    this.texture2 = new THREE.VideoTexture( this.videoA.current );

    this.texture.anisotropy = anisomax
    this.texture.repeat.set(3, 1);
    this.texture.format = THREE.RGBFormat
    this.texture.needsUpdate = true
    console.log(this.texture.image)

    this.texture2.minFilter = THREE.NearestFilter

    let data = new Uint8Array(1024 * 1024 * 3);
    data.fill(100)
    this.combinedTexture = new THREE.DataTexture(data, 1024, 1024, THREE.RGBFormat)
    this.combinedTexture.anisotropy = anisomax;
    this.combinedTexture.needsUpdate = true

    renderer.copyTextureToTexture(new THREE.Vector2(0, 0), this.texture, this.combinedTexture)

    this.material = new THREE.MeshBasicMaterial( { map: this.combinedTexture } );
    this.geometry = new THREE.CylinderGeometry(5*Math.PI, 5*Math.PI, 20, 32, 1, true,0, 2*Math.PI) 
    this.geometry.scale( - 1, 1, 1 );
    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.mesh.position.set(0,0,0)

    this.scene.add(this.mesh)
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
    this.scene.add(ambientLight)

    this.scene.background = new THREE.Color( 0x000000 )

    this.camera            = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000)
    this.controls = new OrbitControls(this.camera,renderer.domElement);
    this.camera.position.z = 4

    renderer.setClearColor('#0d0d1e')
  }

  renderScene = (renderer, gl) => {

    renderer.copyTextureToTexture(new THREE.Vector2(0, 0), this.texture, this.combinedTexture)
    this.combinedTexture.needsUpdate = true
    this.controls.update()
    renderer.render(this.scene, this.camera)
  }

  handleDirectionButtonClick = () => {
    // Flip rotation direction sign
    this.setState({
      rotationDirection: this.state.rotationDirection * -1,
    })
  }

  ended = (current,next) => {
    this.counter ++
    next.src = `https://res.cloudinary.com/cactice/video/upload/v1550364356/dog/c/${this.counter}.mov`
    this.texture = new THREE.VideoTexture( current );
    this.mesh.material.map = this.texture
    this.mesh.material.needsUpdate = true;
    current.play();
  }

  onEndedA = () => {
    this.ended(this.videoB.current,this.videoA.current)
  }
  
  onEndedB = () => {
    this.ended(this.videoA.current,this.videoB.current)
  }

  componentDidMount(){

    let video = this.videoA.current
    video.crossOrigin = "anonymous";
    video.src = `https://res.cloudinary.com/cactice/video/upload/v1550364356/dog/c/${this.counter}.mov`

    this.counter++

    let video2 = this.videoB.current
    video2.crossOrigin = "anonymous";
    video2.src = `https://res.cloudinary.com/cactice/video/upload/v1550364356/dog/c/${this.counter}.mov`


  }

  render = () => {
    return (
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-12'>
            <div className="row" >
              <video ref={this.videoA} onEnded={this.onEndedA} style={{display: `none`}} autoPlay></video>
              <video ref={this.videoB} onEnded={this.onEndedB} style={{display: `none`}}></video>
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



