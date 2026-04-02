# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class CivicWizardryBuilder
      def call(result:)
        result[:focus_spells] = result[:focus_spells].push('earthworks').uniq

        result
      end
    end
  end
end
