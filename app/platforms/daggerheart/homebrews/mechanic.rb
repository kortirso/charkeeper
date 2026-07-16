# frozen_string_literal: true

module Daggerheart
  module Homebrews
    class Mechanic < ::Homebrew
      has_many :items, class_name: 'Daggerheart::Homebrews::MechanicItem', foreign_key: :homebrew_id, dependent: :destroy

      def to_homebrew_json(with_id: true)
        [
          {
            id: with_id ? id : nil,
            title: title,
            description: description,
            public: attributes['public'],
            items: items.order(created_at: :asc).flat_map { |item| item.to_homebrew_json(with_id: with_id) }
          }.compact
        ]
      end
    end
  end
end
