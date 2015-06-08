// Code goes here
var
    theContainer, cubeCamera, mirrorSphereCamera, mirrorSphereCameras = [], theColor = 0xFC6A45, renderer, theSphere, theLight, theScene, theCamera, theGeometry, theMaterial, IS_WIRE_FRAME, ANIMATE;

function onStart() {

    // boilerplate
    theContainer = document.getElementById("theContainer");
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(640, 480);
    theScene = new THREE.Scene();
    theCamera = new THREE.PerspectiveCamera(75, 640 / 480, 0.1, 4000);
    theCamera.position.set(0, 20, 30);
    theContainer.appendChild(renderer.domElement);

    var mousePositionText = document.getElementById('mousePosition');
    var canvasPositionText = document.getElementById('canvasPosition');

//    var boxSize = 12;
    var controls = new THREE.OrbitControls(theCamera, renderer.domElement);


    //theGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    //theGeometry = new THREE.SphereGeometry(boxSize, 16, 16);

    // image from http://wiki.secondlife.com/wiki/Case_Study_-_Example_wood_crate_using_materials

    // SKYBOX from
    var imagePrefix = "img/";
    //var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];

    var mouseVector = new THREE.Vector3();
    var rayCaster = new THREE.Raycaster();

    var hightlightMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0000,
        opacity: 0.6,
        transparent: true
    });

    theMaterial = new THREE.MeshLambertMaterial({
        color: theColor
    });


    function onMouseMove(event) {

        event.preventDefault();

        var offset = $(theContainer).offset();

        // canvas element local
        var localX = event.pageX - offset.left;
        var localY = event.pageY - offset.top;

        // webgl context
        var canvasX = (localX / renderer.domElement.width) * 2 - 1;
        var canvasY = (1 - (localY / renderer.domElement.height)) * 2 - 1;

        $(mousePositionText).text(localX + ', ' + localY);
        $(canvasPositionText).text((Math.round(canvasX * 100) / 100) + ',' + (Math.round(canvasY * 100) / 100));

        checkIntersections(canvasX, canvasY);

    }

    var lastIntersected;
    var intersectables = [];

    function checkIntersections(mouseX, mouseY) {
        var  currentIntersection;

        mouseVector.set(mouseX, mouseY, 1).unproject(theCamera);

        rayCaster.set(
            theCamera.position,
            mouseVector.sub(theCamera.position).normalize());

        var intersections = rayCaster.intersectObjects(intersectables);

        if (intersections.length > 0) {
            currentIntersection = intersections[0].object;
            currentIntersection.material = hightlightMaterial;
        }

        if (lastIntersected !== undefined && lastIntersected !== currentIntersection) {
            lastIntersected.material = theMaterial;
        }

        lastIntersected = currentIntersection;

    }


    buildScene();

    theScene.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            intersectables.push(child);
        }
    });


    $(renderer.domElement).on('touchmove', onMouseMove);
    $(renderer.domElement).on('mousemove', onMouseMove);

    requestAnimationFrame(animate);

    function animate() {
        renderer.render(theScene, theCamera);
        requestAnimationFrame(animate);
    }
}

function buildScene() {
    theAxisHelper = new THREE.AxisHelper(10);
    theAxisHelper.name = 'axis_helper';
    theScene.add(theAxisHelper);

    // the whole chair
    theChairObject = new THREE.Object3D();
    theChairObject.name = 'the_chair';

    // chair's legs
    theLegGeometry = new THREE.BoxGeometry(1, 10, 1);
    var i, x, z;
    for (i = 0; i < 4; i += 1) {
        theLeg = new THREE.Mesh(theLegGeometry, theMaterial);
        x = (i > 1) ? 4 : -4;
        z = (i % 2 === 0) ? 4 : -4;
        theLeg.position.set(x, 0, z);
        theChairObject.add(theLeg);
    }

    // chair's seat
    theSeatGeometry = new THREE.BoxGeometry(9.5, 1, 9.5);
    theSeat = new THREE.Mesh(theSeatGeometry, theMaterial);
    theSeat.position.set(0, 5.5, 0);
    theChairObject.add(theSeat);

    // chair's back
    theBackGeometry = new THREE.BoxGeometry(1, 10, 9);
    theBack = new THREE.Mesh(theBackGeometry, theMaterial);
    theBack.position.set(-3.5, 11, 0);
    theChairObject.add(theBack);
    theChairObject.position.set(-10, 0, 0);
    theScene.add(theChairObject);

    // table object
    theTableObject = new THREE.Object3D();
    theTableObject.name = 'the_table';

    // tables's legs
    theTableLegGeometry = new THREE.CylinderGeometry(0.6, 0.6, 16, 8, 1);
    for (i = 0; i < 4; i += 1) {
        theLeg = new THREE.Mesh(theTableLegGeometry, theMaterial);
        x = (i > 1) ? 6 : -6;
        z = (i % 2 === 0) ? 6 : -6;
        theLeg.position.set(x, 0, z);
        theTableObject.add(theLeg);
    }

    // the table's top
    theTableTopGeometry = new THREE.CylinderGeometry(12, 12, 1, 16, 1);
    theTableTop = new THREE.Mesh(theTableTopGeometry, theMaterial);
    theTableTop.position.set(0, 8.5, 0);
    theTableObject.add(theTableTop);
    theTableObject.position.set(0, 3, 0);
    theScene.add(theTableObject);

    // two lights
    theLight1 = new THREE.DirectionalLight(0xffdddd, 1);
    theLight1.position.set(10, 10, 20)
    theScene.add(theLight1);

    theLight2 = new THREE.DirectionalLight(0xddddff, 0.7);
    theLight2.position.set(10, 10, -20)
    theScene.add(theLight2);

}

function onShowSphere(evt) {
    if (evt.target.checked) {
        theScene.remove(theSphere);
    } else {
        theScene.add(theSphere);
    }
}

function onShowLight(evt) {
    if (evt.target.checked) {
        theScene.remove(theLight);
    } else {
        theScene.add(theLight);
    }
}

function viewShadeless(evt) {
    if (evt.target.checked) {
        theMaterial = new THREE.MeshBasicMaterial({
            'color': theColor,
            'wireframe': IS_WIRE_FRAME

        });
    } else {
        theMaterial = new THREE.MeshLambertMaterial({
            'color': theColor,
            'wireframe': IS_WIRE_FRAME
        });
    }
    theSphere.material = theMaterial;
}

function viewWireframe(evt) {
    IS_WIRE_FRAME = evt.target.checked;

    theSphere.material.setValues({
        'wireframe': IS_WIRE_FRAME
    });
}

function animateScene(evt) {
    ANIMATE = evt.target.checked;
}

function onColor(evt) {
    var value = evt.target.value.toUpperCase().replace(/^#/, "0x");
    theColor = parseInt(value, 16);
    theSphere.material.setValues({
        "color": theColor
    });
}

function setCameraFOV(evt) {
    theCamera.fov = evt.target.value;
    theCamera.updateProjectionMatrix();
}