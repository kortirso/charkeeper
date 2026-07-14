# frozen_string_literal: true

module Daggerheart
  module Homebrews
    class Community < ::Homebrew
      def to_homebrew_json(with_id: true)
        [
          {
            id: with_id ? id : nil,
            title: title,
            description: description,
            public: attributes['public'],
            features: Daggerheart::Feat.where(origin: 'community', origin_value: id).map { |item|
              item.to_homebrew_json(with_id: with_id)
            }
          }.compact
        ]
      end
    end
  end
end
