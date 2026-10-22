# frozen_string_literal: true

module HomebrewsV2
  module Pathfinder2
    class BackgroundSerializer < ApplicationSerializer
      attributes :id, :ability_boosts, :skill_boosts, :lore_names, :feat, :ability_free_boosts

      delegate :ability_boosts, :lore_names, :ability_free_boosts, to: :info
      delegate :info, to: :object

      def skill_boosts
        object.info.skill_boosts.map { |item|
          item == 'free' ? 'Free' : translate(Config.data('pathfinder2', 'skills').dig(item, 'name'))
        }
      end

      def feat
        translate(::Pathfinder2::Feat.find_by(id: object.info['feat'])&.title)
      end
    end
  end
end
