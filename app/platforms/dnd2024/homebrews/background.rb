# frozen_string_literal: true

module Dnd2024
  module Homebrews
    class BackgroundData
      include StoreModel::Model

      attribute :selected_feats, array: true, default: []
      attribute :selected_skills, array: true, default: {}
      attribute :ability_boosts, array: true, default: []
    end

    class Background < ::Homebrew
      attribute :info, Dnd2024::Homebrews::BackgroundData.to_type

      def to_homebrew_json(with_id: true)
        [
          {
            id: with_id ? id : nil,
            title: title,
            description: description,
            public: attributes['public'],
            selected_feats: info.selected_feats,
            selected_skills: info.selected_skills,
            ability_boosts: info.ability_boosts
          }.compact
        ]
      end
    end
  end
end
