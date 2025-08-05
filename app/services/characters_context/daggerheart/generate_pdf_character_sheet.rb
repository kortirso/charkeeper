# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class GeneratePdfCharacterSheet < Prawn::Document
      PAGE_SIZE = 'A4'
      PAGE_LAYOUT = :portrait

      # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
      def to_pdf(character:)
        font Rails.root.join('app/assets/fonts/CascadiaMono-SemiLight.otf')
        stroke_color '000000'

        # health
        5.times do |index|
          fill_color character.health_marked >= index + 1 ? 'C6515C' : 'FFFFFF'
          fill_and_stroke_rounded_rectangle [16 + (index * 17), 536], 14, 7, 1
        end
        (character.health_max - 5).times do |index|
          fill_color character.health_marked >= index + 6 ? 'C6515C' : 'FFFFFF'
          fill_and_stroke_rounded_rectangle [101.5 + (index * 17), 536], 14, 7, 1
        end
        # stress
        6.times do |index|
          fill_color character.stress_marked >= index + 1 ? 'C6515C' : 'FFFFFF'
          fill_and_stroke_rounded_rectangle [39 + (index * 15.1), 516], 12.5, 7, 1
        end
        (character.stress_max - 6).times do |index|
          fill_color character.stress_marked >= index + 6 ? 'C6515C' : 'FFFFFF'
          fill_and_stroke_rounded_rectangle [129.6 + (index * 15.1), 516], 12.5, 7, 1
        end

        fill_color '000000'
        text_box character.evasion.to_s, at: [8, 658], height: 20, width: 20, align: :center
        text_box character.armor_score.to_s, at: [68.5, 658], height: 20, width: 20, align: :center

        render
      end
      # rubocop: enable Metrics/AbcSize, Metrics/MethodLength
    end
  end
end
