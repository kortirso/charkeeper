# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class UntamedBuilder
      def call(result:)
        result[:skill_boosts].merge!({ intimidation: 1 }) { |_, oldval, newval| oldval + newval }
        result[:feats] = result[:feats].push('untamed_form').uniq
        result[:focus_spells] = result[:focus_spells].push('untamed_shift').uniq

        result
      end
    end
  end
end
