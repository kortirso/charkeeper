# frozen_string_literal: true

module Daggerheart
  module Homebrews
    class MechanicItemData
      include StoreModel::Model

      attribute :tier, :integer, default: 1
    end

    class MechanicItem < ::Homebrew
      attribute :info, Daggerheart::Homebrews::MechanicItemData.to_type

      def to_homebrew_json
        [
          {
            id: id,
            title: title,
            description: description,
            tier: info.tier,
            features: Daggerheart::Feat.where(origin: 'mechanic', origin_value: id).map(&:to_homebrew_json)
          }
        ]
      end
    end
  end
end
