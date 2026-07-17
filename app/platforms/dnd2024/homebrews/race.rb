# frozen_string_literal: true

module Dnd2024
  module Homebrews
    class RaceData
      include StoreModel::Model

      # bludge/pierce/slash/acid/cold/fire/force/lighting/necrotic/poison/psychic/radiant/thunder
      attribute :resistance, array: true, default: []
      attribute :immunity, array: true, default: []
      attribute :vulnerability, array: true, default: []
      attribute :size, array: true, default: ['medium'] # small/medium/large
      attribute :vision, array: true, default: {} # { 'darkvision' => 60 } darkvision/truesight/blindsight/tremorsense
      attribute :speed, :integer, default: 30
      attribute :speeds, array: true, default: {} # { 'flight' => 30 } flight/swim/climb/burrow
    end

    class Race < ::Homebrew
      attribute :info, Dnd2024::Homebrews::RaceData.to_type

      def to_homebrew_json(with_id: true) # rubocop: disable Metrics/AbcSize
        [
          {
            id: with_id ? id : nil,
            title: title,
            description: description,
            public: attributes['public'],
            resistance: info.resistance,
            immunity: info.immunity,
            vulnerability: info.vulnerability,
            size: info.size,
            vision: info.vision,
            speed: info.speed,
            speeds: info.speeds,
            features: Dnd2024::Feat.where(origin: 'species', origin_value: id).map { |item|
              item.to_homebrew_json(with_id: with_id)
            }
          }.compact
        ]
      end
    end
  end
end
