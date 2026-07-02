# frozen_string_literal: true

module Daggerheart
  module Homebrews
    class Ancestry < ::Homebrew
      def to_json
        [
          {
            title: title,
            description: description,
            public: attributes['public'],
            features: Daggerheart::Feat.where(origin_value: id).map { _1.to_json }
          }
        ]
      end
    end
  end
end
