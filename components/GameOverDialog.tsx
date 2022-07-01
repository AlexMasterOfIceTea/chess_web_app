import { Dialog, Transition } from "@headlessui/react";
import { FC, Fragment } from "react";
import { colorToString } from "../game/utils";
import { GameState } from "../interfaces/types";

type Props = Pick<GameState, "winner" | "reason"> & {
    onNewGame: () => void;
}

export const GameOverDialog:FC<Props> = ({reason, winner, onNewGame}) => {
    let winnerStr:string;
    if(winner !== "draw")
        winnerStr = colorToString(winner);
    else
        winnerStr = winner;

    return (
        <Transition appear show={winner != null} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onNewGame}>
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
                    {winnerStr+" "}won!
                  </Dialog.Title>

                  <div className="mt-4">
                    <div className="flex flex-row gap-x-4">
                        Reason: {" "+reason}
                    </div>
                    <button
                      type="button"
                      className="mt-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={onNewGame}
                    >
                      Start new Game
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
}