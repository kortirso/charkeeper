# frozen_string_literal: true

module Cosmere
  class Feat < Feat
    PATH_ORIGIN = 'path'
    SPECIALTY_ORIGIN = 'specialty'

    STATIC = 'static' # рендерится текст
    TEXT = 'text' # может вводиться текст

    SELECTABLE_ORIGINS = [0].freeze

    enum :origin, {
      PATH_ORIGIN => 0,
      SPECIALTY_ORIGIN => 1
    }
    enum :kind, { STATIC => 0, TEXT => 1 }
  end
end
