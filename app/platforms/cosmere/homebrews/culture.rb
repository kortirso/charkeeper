# frozen_string_literal: true

module Cosmere
  module Homebrews
    class CultureData
      include StoreModel::Model

      attribute :only, array: true, default: []
    end

    class Culture < ::Homebrew
      attribute :info, Cosmere::Homebrews::CultureData.to_type

      def to_homebrew_json(with_id: true)
        [
          {
            id: with_id ? id : nil,
            title: title,
            description: description,
            only: info.only,
            public: attributes['public']
          }.compact
        ]
      end
    end
  end
end
