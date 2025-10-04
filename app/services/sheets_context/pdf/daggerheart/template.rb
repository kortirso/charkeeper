# frozen_string_literal: true

module SheetsContext
  module Pdf
    module Daggerheart
      class Template < SheetsContext::Pdf::Template
        # rubocop: disable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity, Style/NestedTernaryOperator, Metrics/CyclomaticComplexity
        def to_pdf(character:)
          super

          traits_names = ::Daggerheart::Character.traits
          font_size 6
          fill_color 'FFFFFF'
          %w[agi str fin ins pre know].each_with_index do |item, index|
            trait_name = traits_names[item].dig('name', I18n.locale.to_s)
            text_box trait_name, at: [233 + (55 * index), 736], width: 43, align: :center
          end

          text_box I18n.t('services.sheets_context.daggerheart.proficiency'), at: [48, 700], width: 43, align: :center
          text_box I18n.t('services.sheets_context.daggerheart.evasion'), at: [101, 700], width: 43, align: :center
          text_box I18n.t('services.sheets_context.daggerheart.armor_score'), at: [154, 700], width: 43, align: :center

          font_size 12
          fill_color '000000'
          %w[agi str fin ins pre know].each_with_index do |item, index|
            value = "#{'+' if character.modified_traits[item].positive?}#{character.modified_traits[item]}"
            text_box value, at: [242 + (index * 55), 718], width: 25, height: 14, align: :center
          end

          text_box "+#{character.proficiency}", at: [51, 722], width: 37, height: 14, align: :center
          text_box character.evasion.to_s, at: [104, 722], width: 37, height: 14, align: :center
          text_box character.armor_score.to_s, at: [157, 722], width: 37, height: 14, align: :center

          text_box character.damage_thresholds['major'].to_s, at: [80, 622], width: 35, height: 14, align: :center
          text_box character.damage_thresholds['severe'].to_s, at: [175, 622], width: 35, height: 14, align: :center

          # armor slots
          character.armor_score.times do |index|
            fill_color character.spent_armor_slots >= index + 1 ? 'C6515C' : 'FFFFFF'
            fill_and_stroke_rounded_rectangle [104 + (index * 13), 578], 11, 11, 1
          end
          # health
          character.health_max.times do |index|
            fill_color character.health_marked >= index + 1 ? 'C6515C' : 'FFFFFF'
            fill_and_stroke_rounded_rectangle [104 + (index * 13), 563], 11, 11, 1
          end
          # stress
          character.stress_max.times do |index|
            fill_color character.stress_marked >= index + 1 ? 'C6515C' : 'FFFFFF'
            fill_and_stroke_rounded_rectangle [104 + (index * 13), 548], 11, 11, 1
          end
          # hope
          character.hope_max.times do |index|
            fill_color character.hope_marked >= index + 1 ? 'C6515C' : 'FFFFFF'
            fill_and_stroke_rounded_rectangle [104 + (index * 13), 533], 11, 11, 1
          end

          font_size 4
          fill_color '444444'
          text_box I18n.t('services.sheets_context.attack').upcase, at: [430, 640], width: 25, height: 10, align: :center
          text_box I18n.t('services.sheets_context.dist').upcase, at: [455, 640], width: 30, height: 10, align: :center
          text_box I18n.t('services.sheets_context.damage').upcase, at: [485, 640], width: 35, height: 10, align: :center
          text_box I18n.t('services.sheets_context.type').upcase, at: [520, 640], width: 30, height: 10, align: :center

          fill_color '000000'
          character.attacks.first(10).each_with_index do |attack, index|
            font_size 8
            text_box attack[:name], at: [327, 629 - (index * 36)], width: 100, height: 14

            font_size 6
            text_box "#{'+' if attack[:attack_bonus].positive?}#{attack[:attack_bonus]}", at: [430, 629 - (index * 36)], width: 25, height: 14, align: :center # rubocop: disable Layout/LineLength
            text_box attack[:range], at: [455, 629 - (index * 36)], width: 30, height: 14, align: :center

            damage = attack[:damage].include?('d') ? "#{attack[:damage]}#{'+' if attack[:damage_bonus].positive?}#{attack[:damage_bonus] unless attack[:damage_bonus].zero?}" : ((attack[:damage].to_i + attack[:damage_bonus]).positive? ? (attack[:damage].to_i + attack[:damage_bonus]).to_s : '-') # rubocop: disable Layout/LineLength
            text_box damage, at: [485, 629 - (index * 36)], width: 35, height: 14, align: :center
            text_box attack[:damage_type].first(3), at: [520, 629 - (index * 36)], width: 30, height: 14, align: :center
          end

          font_size 10
          fill_color '000000'
          character.experience.sort_by { |item| -item['exp_level'] }.first(10).each_with_index do |experience, index|
            text_box experience['exp_name'], at: [52, 467 - (index * 20)], width: 140, height: 14
            text_box "+#{experience['exp_level']}", at: [200, 467 - (index * 20)], width: 38, align: :center
          end

          text_box I18n.t('services.sheets_context.daggerheart.health'), at: [70, 659], width: 150, align: :center
          text_box I18n.t('services.sheets_context.daggerheart.experience'), at: [70, 494], width: 150, align: :center
          text_box I18n.t('services.sheets_context.dnd.attacks'), at: [346, 659], width: 175, align: :center

          text_box I18n.t('services.sheets_context.daggerheart.armor_slots'), at: [32, 578], width: 150
          text_box I18n.t('services.sheets_context.daggerheart.hp'), at: [32, 563], width: 150
          text_box I18n.t('services.sheets_context.daggerheart.stress'), at: [32, 548], width: 150
          text_box I18n.t('services.sheets_context.daggerheart.hope'), at: [32, 533], width: 150

          text_box I18n.t('services.sheets_context.daggerheart.minor'), at: [20, 621], width: 60, align: :center
          text_box I18n.t('services.sheets_context.daggerheart.major'), at: [115, 621], width: 60, align: :center
          text_box I18n.t('services.sheets_context.daggerheart.severe'), at: [210, 621], width: 60, align: :center

          render
        end
        # rubocop: enable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity, Style/NestedTernaryOperator, Metrics/CyclomaticComplexity

        private

        def heritage(character)
          "#{race(character)} / #{community(character)}"
        end

        def classes(character)
          character.subclasses.map { |key, value| "#{class_name(key)} (#{subclass_name(key, value)})" }.join(' / ')
        end

        def race(character)
          character.parent.ancestry_name
        end

        def community(character)
          character.parent.community_name
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
end
