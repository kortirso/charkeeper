# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class EnigmaBuilder
      def call(result:)
        result[:feats] = result[:feats].push('bardic_lore').uniq
        result[:spells] = result[:spells].push('sure_strike').uniq

        result
      end
    end
  end
end
