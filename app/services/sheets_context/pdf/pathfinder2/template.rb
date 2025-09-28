# frozen_string_literal: true

module SheetsContext
  module Pdf
    module Pathfinder2
      class Template < SheetsContext::Pdf::Template
        # rubocop: disable Metrics/AbcSize
        def to_pdf(character:)
          super

          abilities_names = ::Pathfinder2::Character.abilities
          font Rails.root.join('app/assets/fonts/Roboto-Regular.ttf') do
            font_size 6
            fill_color 'FFFFFF'
            %w[str dex con int wis cha].each_with_index do |item, index|
              ability_name = abilities_names[item].dig('name', I18n.locale.to_s)
              text_box ability_name, at: [233 + (55 * index), 735], width: 43, align: :center
            end
          end

          font_size 12
          fill_color '000000'
          %w[str dex con int wis cha].each_with_index do |item, index|
            value = "#{'+' if character.abilities[item].positive?}#{character.abilities[item]}"
            text_box value, at: [242 + (index * 55), 718], width: 25, height: 14, align: :center
          end

          render
        end
        # rubocop: enable Metrics/AbcSize

        private

        def heritage(...)
          ''
        end

        def classes(...)
          ''
        end
      end
    end
  end
end
