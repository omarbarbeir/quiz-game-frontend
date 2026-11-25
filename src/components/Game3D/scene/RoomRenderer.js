import React from 'react';
import { ROOMS } from '../data/rooms3DData';
import Door from './Door';
import KarimApartment from './rooms/KarimApartment';
import Hallway from './rooms/Hallway';
import Street from './rooms/Street';
import Apartment4B from './rooms/Apartment4B';

export default function RoomRenderer({ currentRoomId }) {
  const room = ROOMS[currentRoomId];
  if (!room) return null;

  return (
    <group key={currentRoomId}>
      {/* شقة كريم — مبنية بالكامل في KarimApartment */}
      {currentRoomId === 'karim_apartment' && <KarimApartment />}
      {currentRoomId === 'building_hallway' && <Hallway />}
      {currentRoomId === 'street' && <Street />}
      {currentRoomId === 'apartment_4b' && <Apartment4B />}
      
      {/* الأبواب */}
      {room.doors?.map((door) => (
        <Door
          key={door.id}
          position={door.position}
          rotation={door.rotation}
        />
      ))}
    </group>
  );
}