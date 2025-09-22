# frozen_string_literal: true

module SheetsContext
  module Dnd5
    class Template < SheetsContext::Template
      # rubocop: disable Metrics/AbcSize
      def to_pdf(character:)
        super

        abilities_names = ::Dnd2024::Character.abilities
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
          text_box character.modified_abilities[item].to_s, at: [242 + (index * 55), 718], width: 25, height: 14, align: :center

          font_size 10
          value = "#{'+' if character.modifiers[item].positive?}#{character.modifiers[item]}"
          text_box value, at: [245.5 + (index * 55), 699], width: 18, height: 14, align: :center
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
