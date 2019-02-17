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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import faForward from '@fortawesome/fontawesome-free-solid/faForward'
import faBackward from '@fortawesome/fontawesome-free-solid/faBackward'

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
export default class Scene2 extends React.Component {

  constructor(props, context) {
    super(props, context)
    this.state = {
      rotationDirection: +1,   // shows which direction cube spins
    }
    this.start = Date.now()
    this.scene = new THREE.Scene()

    var loader = new THREE.TextureLoader()
    loader.load('/static/threejs/UVface2.webp', (tex)=> {
      this.uniforms = {
        texture1: { type: 't', value: tex},
        time    : { // float initialized to 0
          type : 'f',
          value: 0.0,
        },
      }
      this.material = new THREE.ShaderMaterial({
        uniforms      : this.uniforms,
        vertexShader  : vertShader,
        fragmentShader: fragShader,
      })

      let loader = new THREE.JSONLoader()
      loader.load( '/static/threejs/me4.json', ( geometry, materials ) => {
        let json = new THREE.Mesh( geometry, this.material)
        json.position.set( 0,1,-1)
        json.scale.set( 1, 1, 1 )
      } )
    })
    this.video = React.createRef();
  }


  onResize = (renderer, gl, { width, height }) => {
    // This function is called after canvas has been resized.

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  initScene = (renderer, gl) => {
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
    this.scene.add(ambientLight)

    this.scene.background = new THREE.Color( 0xf0f0f0 )

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

  componentDidMount(){
    let video = this.video.current
    video.src = 'https://res.cloudinary.com/cactice/video/upload/v1550364356/dog/c/1.mov'
    let hls = new Hls();
      video.play();

    this.texture = new THREE.VideoTexture( video );
    this.material = new THREE.MeshBasicMaterial( { map: this.texture } );
    this.geometry = new THREE.PlaneBufferGeometry( 16, 9 );
    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.mesh.position.set(0,5,-10)
    this.scene.add(this.mesh)
  }

  render = () => {
    return (
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-12'>
            <div className="row" >
              <video ref={this.video}></video>
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



