# frozen_string_literal: true

module Pathfinder2
  module Homebrews
    class BackgroundData
      include StoreModel::Model

      attribute :feat, :string
      attribute :lore_name, :string
      attribute :skill_boosts, array: true, default: {}
      attribute :ability_boosts, array: true, default: []
    end

    class Background < ::Homebrew
      attribute :info, Pathfinder2::Homebrews::BackgroundData.to_type

      def to_homebrew_json(with_id: true)
        [
          {
            id: with_id ? id : nil,
            title: title,
            description: description,
            public: attributes['public'],
            feat: info.feat,
            lore_name: info.lore_name,
            skill_boosts: info.skill_boosts,
            ability_boosts: info.ability_boosts.split('_')
          }.compact
        ]
      end
    end
  end
end
