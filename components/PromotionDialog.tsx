import { FC, Fragment, useState } from "react";
import { GameMove, Piece, PieceColor, PieceType, PromotionPieces } from "../interfaces/types";
import { getImagePath } from "../game/utils";
import { BISHOP, KNIGHT, QUEEN, ROOK } from "../interfaces/constants";
import { Dialog, Transition } from "@headlessui/react";

type Props = {
    open:boolean,
    color: PieceColor,
    onChange: (piece:PromotionPieces) => void
}

export const PromotionDialog:FC<Props> = ({onChange, open, color}) => {
    const [triedToClose, setTrying] = useState(false);

    return (
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setTrying(true)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Promote your Pawn
                  </Dialog.Title>

                  <div className="mt-4">
                    <div className="flex flex-row gap-x-4">
                    {([ROOK, KNIGHT, BISHOP, QUEEN] as PromotionPieces[]).map(p => (
                        <div 
                            key={p}
                            onClick={() => {
                              onChange(p);
                              setTrying(false);
                            }}
                            style={{backgroundImage: `url(${getImagePath(color | p)})`}}
                            className="w-20 h-20 bg-cover"
                        ></div>
                    ))}
                    </div>
                    <p className={`text-red-500 transition-all ${triedToClose ? 'translate-y-0 opacity-100' : 'opacity-0 -translate-y-4'}`}>
                      You cannot change your move now, must promote your pawn
                    </p>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
}