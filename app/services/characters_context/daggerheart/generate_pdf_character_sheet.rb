# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class GeneratePdfCharacterSheet < Prawn::Document
      PAGE_SIZE = 'A4'
      PAGE_LAYOUT = :portrait

      # rubocop: disable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity, Layout/LineLength
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

        # removing
        fill_color 'FFFFFF'
        fill_rectangle [-6, 474], 230, 50
        fill_rectangle [-10, 40], 175, 10

        # hope
        initial_hope_index = character.hope_max == 7 ? 10 : 25
        character.hope_marked.times do |index|
          rotate(45, origin: [initial_hope_index + (index * 32.25), 455]) do
            fill_color 'C6515C'
            fill_and_stroke_rounded_rectangle [initial_hope_index - 5.5 + (index * 32.25), 458.5], 9.5, 9.5, 1
          end
        end
        (character.hope_max - character.hope_marked).times do |index|
          index += character.hope_marked
          rotate(45, origin: [initial_hope_index + (index * 32.25), 455]) do
            stroke_rounded_rectangle [initial_hope_index - 5.5 + (index * 32.25), 458.5], 9.5, 9.5, 1
          end
        end

        fill_color '000000'
        text_box character.evasion.to_s, at: [8, 658], height: 20, width: 20, align: :center
        text_box character.armor_score.to_s, at: [68.5, 658], height: 20, width: 20, align: :center

        # rectangle [137.5, 572], 22, 15
        # stroke

        [['agi', 175], ['str', 238], ['fin', 298], ['ins', 359], ['pre', 422], ['know', 482]].each do |item|
          text_box "#{'+' if character.modified_traits[item[0]].positive?}#{character.modified_traits[item[0]]}", at: [item[1], 668], width: 28, height: 14, align: :center
        end
        text_box character.level.to_s, at: [490, 725], width: 28, height: 14, align: :center

        text_box character.damage_thresholds['major'].to_s, at: [56, 572], width: 22, height: 14, align: :center
        text_box character.damage_thresholds['severe'].to_s, at: [137, 572], width: 22, height: 14, align: :center

        font Rails.root.join('app/assets/fonts/Roboto-Regular.ttf') do
          font_size 8
          text_box character.name, at: [174, 732], width: 150
          text_box character.heritage ? ::Daggerheart::Character.heritage_info(character.heritage).dig('name', I18n.locale.to_s) : character.heritage_name, at: [164, 713], width: 150

          classes = character.subclasses.map { |key, value| "#{class_name(key)} - #{subclass_name(key, value)}" }.join('/')
          text_box classes, at: [323, 713], width: 150
        end

        render
      end
      # rubocop: enable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity, Layout/LineLength

      private

      def class_name(class_slug)
        default = ::Daggerheart::Character.class_info(class_slug)
        default ? default.dig('name', I18n.locale.to_s) : ::Daggerheart::Homebrew::Speciality.find(class_slug).name
      end

      def subclass_name(class_slug, subclass_slug)
        default = ::Daggerheart::Character.subclass_info(class_slug, subclass_slug)
        default ? default.dig('name', I18n.locale.to_s) : ::Daggerheart::Homebrew::Subclass.find(subclass_slug).name
      end
    end
  end
end
