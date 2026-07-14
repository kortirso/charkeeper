# frozen_string_literal: true

module Daggerheart
  module Homebrews
    class MechanicItemData
      include StoreModel::Model

      attribute :tier, :integer, default: 1
    end

    class MechanicItem < ::Homebrew
      attribute :info, Daggerheart::Homebrews::MechanicItemData.to_type

      def to_homebrew_json(with_id: true)
        [
          {
            id: with_id ? id : nil,
            title: title,
            description: description,
            tier: info.tier,
            features: Daggerheart::Feat.where(origin: 'mechanic', origin_value: id).map { |item|
              item.to_homebrew_json(with_id: with_id)
            }
          }.compact
        ]
      end
    end
  end
end
