# frozen_string_literal: true

module Pathfinder2
  module Homebrews
    class RaceData
      include StoreModel::Model

      attribute :speed, :integer, default: 25
      attribute :health, :integer, default: 8
      attribute :languages, array: true, default: []
      attribute :abilities, array: true, default: {}
      attribute :ability_boosts, array: true, default: []
      attribute :vision, :string
    end

    class Race < ::Homebrew
      attribute :info, Pathfinder2::Homebrews::RaceData.to_type

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
