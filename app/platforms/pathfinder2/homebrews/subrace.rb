# frozen_string_literal: true

module Pathfinder2
  module Homebrews
    class SubraceData
      include StoreModel::Model

      attribute :race_id, :string
      attribute :speed, :integer
      attribute :health, :integer
      attribute :skill_boosts, array: true, default: []
      attribute :feats, array: true, default: []
      attribute :vision, :string
    end

    class Subrace < ::Homebrew
      attribute :info, Pathfinder2::Homebrews::SubraceData.to_type

      def to_homebrew_json(with_id: true)
        [
          info.attributes.symbolize_keys({
            id: with_id ? id : nil,
            title: title,
            description: description,
            public: attributes['public']
          }).compact
        ]
      end
    end
  end
end
