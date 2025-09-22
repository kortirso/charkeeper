# frozen_string_literal: true

module SheetsContext
  module Daggerheart
    class Template < SheetsContext::Template
      # rubocop: disable Metrics/AbcSize
      def to_pdf(character:)
        super

        traits_names = ::Daggerheart::Character.traits
        font Rails.root.join('app/assets/fonts/Roboto-Regular.ttf') do
          font_size 6
          fill_color 'FFFFFF'
          %w[agi str fin ins pre know].each_with_index do |item, index|
            trait_name = traits_names[item].dig('name', I18n.locale.to_s)
            text_box trait_name, at: [233 + (55 * index), 735], width: 43, align: :center
          end
        end

        font_size 12
        fill_color '000000'
        %w[agi str fin ins pre know].each_with_index do |item, index|
          value = "#{'+' if character.modified_traits[item].positive?}#{character.modified_traits[item]}"
          text_box value, at: [242 + (index * 55), 718], width: 25, height: 14, align: :center
        end

        # health
        # 5.times do |index|
        #   fill_color character.health_marked >= index + 1 ? 'C6515C' : 'FFFFFF'
        #   fill_and_stroke_rounded_rectangle [16 + (index * 17), 536], 14, 7, 1
        # end
        # (character.health_max - 5).times do |index|
        #   fill_color character.health_marked >= index + 6 ? 'C6515C' : 'FFFFFF'
        #   fill_and_stroke_rounded_rectangle [101.5 + (index * 17), 536], 14, 7, 1
        # end
        # # stress
        # 6.times do |index|
        #   fill_color character.stress_marked >= index + 1 ? 'C6515C' : 'FFFFFF'
        #   fill_and_stroke_rounded_rectangle [39 + (index * 15.1), 516], 12.5, 7, 1
        # end
        # (character.stress_max - 6).times do |index|
        #   fill_color character.stress_marked >= index + 6 ? 'C6515C' : 'FFFFFF'
        #   fill_and_stroke_rounded_rectangle [129.6 + (index * 15.1), 516], 12.5, 7, 1
        # end

        # removing hope
        # fill_color 'FFFFFF'
        # fill_rectangle [-6, 474], 230, 50
        # fill_rectangle [-10, 40], 175, 10

        # hope
        # initial_hope_index = character.hope_max == 7 ? 10 : 25
        # character.hope_marked.times do |index|
        #   rotate(45, origin: [initial_hope_index + (index * 32.25), 455]) do
        #     fill_color 'C6515C'
        #     fill_and_stroke_rounded_rectangle [initial_hope_index - 5.5 + (index * 32.25), 458.5], 9.5, 9.5, 1
        #   end
        # end
        # (character.hope_max - character.hope_marked).times do |index|
        #   index += character.hope_marked
        #   rotate(45, origin: [initial_hope_index + (index * 32.25), 455]) do
        #     stroke_rounded_rectangle [initial_hope_index - 5.5 + (index * 32.25), 458.5], 9.5, 9.5, 1
        #   end
        # end

        # fill_color '000000'
        # text_box character.evasion.to_s, at: [8, 658], height: 20, width: 20, align: :center
        # text_box character.armor_score.to_s, at: [68.5, 658], height: 20, width: 20, align: :center

        # rectangle [170, 682], 39, 21
        # stroke

        # text_box character.damage_thresholds['major'].to_s, at: [56, 572], width: 22, height: 14, align: :center
        # text_box character.damage_thresholds['severe'].to_s, at: [137, 572], width: 22, height: 14, align: :center

        # font Rails.root.join('app/assets/fonts/Roboto-Regular.ttf') do
        #   character.experience.sort_by { |item| -item['exp_level'] }.first(5).each_with_index do |experience, index|
        #     text_box experience['exp_name'], at: [0, 395 - (index * 18)], width: 175
        #     text_box "+#{experience['exp_level']}", at: [195, 395 - (index * 18)], width: 25
        #   end
        # end

        render
      end
      # rubocop: enable Metrics/AbcSize

      private

      def heritage(character)
        "#{race(character)} / #{community(character)}"
      end

      def classes(character)
        character.subclasses.map { |key, value| "#{class_name(key)} (#{subclass_name(key, value)})" }.join(' / ')
      end

      def race(character)
        return character.heritage_name if character.heritage.nil?

        default = ::Daggerheart::Character.heritage_info(character.heritage)
        default ? default.dig('name', I18n.locale.to_s) : ::Daggerheart::Homebrew::Race.find(character.heritage).name
      end

      def community(character)
        default = ::Daggerheart::Character.community_info(character.community)
        default ? default.dig('name', I18n.locale.to_s) : ::Daggerheart::Homebrew::Community.find(character.community).name
      end

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
