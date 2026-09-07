# frozen_string_literal: true

module Cosmere
  module Homebrews
    class InvestedArtData
      include StoreModel::Model

      attribute :only, array: true, default: []
      attribute :initial_talents, array: true, default: []
    end

    class InvestedArt < ::Homebrew
      attribute :info, Cosmere::Homebrews::InvestedArtData.to_type

      def to_homebrew_json(with_id: true)
        [
          {
            id: with_id ? id : nil,
            title: title,
            description: description,
            only: info.only,
            initial_talents: info.initial_talents,
            public: attributes['public'],
            features: Cosmere::Feat.where(origin: 'surge', origin_value: id).order(created_at: :asc).map { |item|
              item.to_homebrew_json(with_id: with_id)
            }
          }.compact
        ]
      end
    end
  end
end
