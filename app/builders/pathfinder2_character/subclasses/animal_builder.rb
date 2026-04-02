# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class AnimalBuilder
      def call(result:)
        result[:skill_boosts].merge!({ athletics: 1 }) { |_, oldval, newval| oldval + newval }
        result[:feats] = result[:feats].push('druid_animal_companion').uniq
        result[:focus_spells] = result[:focus_spells].push('heal_animal').uniq

        result
      end
    end
  end
end
