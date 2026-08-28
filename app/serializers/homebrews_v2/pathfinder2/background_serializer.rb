# frozen_string_literal: true

module HomebrewsV2
  module Pathfinder2
    class BackgroundSerializer < ApplicationSerializer
      attributes :id, :ability_boosts, :skill_boosts, :lore_name, :feat

      def ability_boosts
        object.info['ability_boosts'].split('_')
      end

      def skill_boosts
        object.info['skill_boosts']
      end

      def lore_name
        object.info['lore_name']
      end

      def feat
        translate(::Pathfinder2::Feat.find_by(id: object.info['feat'])&.title)
      end
    end
  end
end
