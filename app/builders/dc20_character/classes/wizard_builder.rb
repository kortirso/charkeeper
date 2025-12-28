# frozen_string_literal: true

module Dc20Character
  module Classes
    class WizardBuilder
      COMBAT_EXPERTISE = %w[light_armor focuses].freeze

      def call(result:)
        result[:combat_expertise] = COMBAT_EXPERTISE
        result[:health] = { current: 8, temp: 0 }
        result[:spell_list] = ['arcane']
        result[:path] = ['spellcaster']

        result
      end
    end
  end
end
