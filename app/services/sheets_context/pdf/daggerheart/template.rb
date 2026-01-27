# frozen_string_literal: true

module SheetsContext
  module Pdf
    module Daggerheart
      class Template < SheetsContext::Pdf::Template
        include Deps[markdown: 'markdown']

        # rubocop: disable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity, Style/NestedTernaryOperator, Metrics/CyclomaticComplexity, Layout/LineLength
        def to_pdf(character:)
          super

          traits_names = ::Daggerheart::Character.traits
          font_size 6
          fill_color 'FFFFFF'
          %w[str agi fin ins pre know].each_with_index do |item, index|
            trait_name = traits_names[item].dig('name', I18n.locale.to_s)
            text_box trait_name, at: [233 + (55 * index), 736], width: 43, align: :center
          end

          text_box I18n.t('services.sheets_context.daggerheart.proficiency'), at: [48, 700], width: 43, align: :center
          text_box I18n.t('services.sheets_context.daggerheart.evasion'), at: [101, 700], width: 43, align: :center
          text_box I18n.t('services.sheets_context.daggerheart.armor_score'), at: [154, 700], width: 43, align: :center

          font_size 12
          fill_color '000000'
          %w[str agi fin ins pre know].each_with_index do |item, index|
            value = "#{'+' if character.modified_traits[item].positive?}#{character.modified_traits[item]}"
            text_box value, at: [242 + (index * 55), 718], width: 25, height: 14, align: :center
          end

          text_box character.proficiency.to_s, at: [51, 722], width: 37, height: 14, align: :center
          text_box character.evasion.to_s, at: [104, 722], width: 37, height: 14, align: :center
          text_box character.armor_score.to_s, at: [157, 722], width: 37, height: 14, align: :center

          text_box character.damage_thresholds['major'].to_s, at: [78, 622], width: 35, height: 14, align: :center
          text_box character.damage_thresholds['severe'].to_s, at: [173, 622], width: 35, height: 14, align: :center

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
          text_box I18n.t('services.sheets_context.attack'), at: [430, 640], width: 25, height: 10, align: :center
          text_box I18n.t('services.sheets_context.trait'), at: [455, 640], width: 30, height: 10, align: :center
          text_box I18n.t('services.sheets_context.damage'), at: [485, 640], width: 35, height: 10, align: :center
          text_box I18n.t('services.sheets_context.dist'), at: [520, 640], width: 30, height: 10, align: :center

          fill_color '000000'
          character.attacks.sort_by { |item| item[:ready_to_use] ? 0 : 1 }.first(10).each_with_index do |attack, index|
            font_size 8
            formatted_text_box [{ text: attack[:name], styles: attack[:ready_to_use] ? [:bold] : [], color: attack[:ready_to_use] ? '000000' : '444444' }], at: [327, 629 - (index * 52)], width: 100, height: 14

            font_size 6
            text_box "#{'+' if attack[:attack_bonus].positive?}#{attack[:attack_bonus]}", at: [430, 629 - (index * 52)], width: 25, height: 14, align: :center
            text_box ::Daggerheart::Character.traits.dig(attack[:trait], 'shortName', I18n.locale.to_s).to_s, at: [455, 629 - (index * 52)], width: 30, height: 14, align: :center

            damage = attack[:damage].include?('d') ? "#{attack[:damage]}#{'+' if attack[:damage_bonus].positive?}#{attack[:damage_bonus] unless attack[:damage_bonus].zero?}" : ((attack[:damage].to_i + attack[:damage_bonus]).positive? ? (attack[:damage].to_i + attack[:damage_bonus]).to_s : '-')
            text_box damage, at: [485, 629 - (index * 52)], width: 35, height: 14, align: :center
            text_box ::Daggerheart::Character.ranges.dig(attack[:range], 'shortName', 'en').to_s, at: [520, 629 - (index * 52)], width: 30, height: 14, align: :center

            text_box attack[:tags].values.join(' / '), at: [327, 612 - (index * 52)], width: 200, height: 14

            if attack[:features].any?
              font_size 5
              text_box attack[:features][0][I18n.locale.to_s], at: [327, 601 - (index * 52)], width: 200, height: 14
            end
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

          render_equipment_page(character)

          %w[coins handfuls bags chests].each_with_index do |key, index|
            font_size 6
            fill_color 'FFFFFF'
            text_box I18n.t("services.sheets_context.gold.#{key}"), at: [51 + (index * 59), 759], width: 48, align: :center

            font_size 12
            fill_color '000000'
            text_box character.gold[key].to_s, at: [54 + (index * 59), 781], width: 42, height: 14, align: :center
          end

          start_new_page

          font_size 10
          text_box I18n.t('services.sheets_context.daggerheart.domain_cards'), at: [210, 818], width: 175, align: :center

          character.parent.feats.includes(:feat).where(feats: { origin: 7 })
            .sort_by { |item| item[:ready_to_use] ? 0 : 1 }
            .each_slice(3).to_a.each_with_index do |group, group_index|
              group.each_with_index do |feat, index|
                font_size 6
                fill_color '444444'
                text_box I18n.t('services.sheets_context.daggerheart.level', value: feat.feat.conditions['level']), at: [52 + (index * 175), 770 - (group_index * 127)], width: 150, height: 14, align: :right

                font_size 10
                fill_color '000000'
                text_box feat.feat.title[I18n.locale.to_s], at: [52 + (index * 175), 788 - (group_index * 127)], width: 140, height: 14

                font_size 5
                card_text = markdown.call(value: feat.feat.description[I18n.locale.to_s], version: '0.4.4')
                text_box card_text.gsub(%r{</?p[^>]*>}i, '').gsub(/{{[a-z]+}}/, 'x'), at: [48 + (index * 175), 758 - (group_index * 127)], width: 160, height: 90, inline_format: true
              end
            end

          render
        end
        # rubocop: enable Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity, Style/NestedTernaryOperator, Metrics/CyclomaticComplexity, Layout/LineLength

        private

        def heritage(character)
          "#{race(character)} / #{community(character)}"
        end

        def classes(character)
          character.parent.subclass_names.map { |key, value| "#{key} (#{value})" }.join(' / ')
        end

        def race(character)
          character.parent.ancestry_name
        end

        def community(character)
          character.parent.community_name
        end
      end
    end
  end
end
