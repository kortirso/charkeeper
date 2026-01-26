# frozen_string_literal: true

module SheetsContext
  module Pdf
    module Dnd
      class Template < SheetsContext::Pdf::Template
        # rubocop: disable Metrics/AbcSize, Layout/LineLength,  Metrics/MethodLength, Style/NestedTernaryOperator, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
        def to_pdf(character:)
          super

          abilities_names = ::Dnd2024::Character.abilities
          fill_color 'FFFFFF'
          %w[str dex con int wis cha].each_with_index do |item, index|
            ability_name = abilities_names[item].dig('name', I18n.locale.to_s)

            font_size 6
            text_box ability_name, at: [233 + (55 * index), 736], width: 43, align: :center

            font_size 5
            text_box ability_name, at: [311 + (42 * index), 599.5], width: 36, align: :center
          end

          text_box I18n.t('services.sheets_context.dnd.armor_class'), at: [48, 700], width: 43, align: :center
          text_box I18n.t('services.sheets_context.dnd.initiative'), at: [101, 700], width: 43, align: :center
          text_box I18n.t('services.sheets_context.dnd.speed'), at: [154, 700], width: 43, align: :center

          fill_color '000000'
          %w[str dex con int wis cha].each_with_index do |item, index|
            font_size 12
            value = "#{'+' if character.modifiers[item].positive?}#{character.modifiers[item]}"
            text_box value, at: [242 + (index * 55), 720], width: 25, height: 14, align: :center

            font_size 10
            text_box character.modified_abilities[item].to_s, at: [245.5 + (index * 55), 699], width: 18, height: 14, align: :center

            font_size 12
            value = "#{'+' if character.save_dc[item].positive?}#{character.save_dc[item]}"
            text_box value, at: [314 + (index * 42), 620], width: 30, height: 14, align: :center
          end

          font_size 12
          text_box character.armor_class.to_s, at: [51, 722], width: 37, height: 14, align: :center
          text_box "+#{character.initiative}", at: [104, 722], width: 37, height: 14, align: :center
          text_box character.speed.to_s, at: [157, 722], width: 37, height: 14, align: :center

          font_size 16
          text_box character.health['current'].to_s, at: [30, 624], width: 70, align: :center
          text_box character.health['max'].to_s, at: [110, 624], width: 70, align: :center
          text_box character.health['temp'].to_s, at: [190, 624], width: 70, align: :center

          font_size 8
          text_box 'd6', at: [50, 576], width: 40
          text_box 'd8', at: [50, 561], width: 40
          text_box 'd10', at: [50, 546], width: 40
          text_box 'd12', at: [50, 531], width: 40

          text_box "#{character.hit_dice['6'] - character.spent_hit_dice['6'].to_i} / #{character.hit_dice['6']}", at: [100, 576], width: 40
          text_box "#{character.hit_dice['8'] - character.spent_hit_dice['8'].to_i} / #{character.hit_dice['8']}", at: [100, 561], width: 40
          text_box "#{character.hit_dice['10'] - character.spent_hit_dice['10'].to_i} / #{character.hit_dice['10']}", at: [100, 546], width: 40
          text_box "#{character.hit_dice['12'] - character.spent_hit_dice['12'].to_i} / #{character.hit_dice['12']}", at: [100, 531], width: 40

          font_size 10
          fill_color '000000'
          skills_names = ::Dnd2024::Character.skills
          character.skills.map { |skill|
            skill[:name] = skills_names[skill[:slug]].dig('name', I18n.locale.to_s)
            skill
          }.sort_by { |item| item[:name] }.each_with_index do |skill, index| # rubocop: disable Style/MultilineBlockChain
            text_box skill[:name], at: [52, 467 - (index * 20)], width: 140
            text_box "#{'+' if skill[:modifier].positive?}#{skill[:modifier]}", at: [200, 467 - (index * 20)], width: 38, align: :center
          end

          font_size 4
          fill_color '444444'
          text_box I18n.t('services.sheets_context.attack').upcase, at: [430, 545], width: 25, height: 10, align: :center
          # text_box I18n.t('services.sheets_context.dist').upcase, at: [455, 545], width: 30, height: 10, align: :center
          text_box I18n.t('services.sheets_context.damage').upcase, at: [485, 545], width: 35, height: 10, align: :center
          text_box I18n.t('services.sheets_context.dist').upcase, at: [520, 545], width: 30, height: 10, align: :center

          fill_color '000000'
          character.attacks.sort_by { |item| item[:ready_to_use] ? 0 : 1 }.first(12).each_with_index do |attack, index|
            font_size 8
            text_box attack[:name], at: [327, 534 - (index * 36)], width: 100, height: 14

            font_size 6
            text_box "#{'+' if attack[:attack_bonus].positive?}#{attack[:attack_bonus]}", at: [430, 534 - (index * 36)], width: 25, height: 14, align: :center
            if attack[:melee_distance]
              text_box attack[:melee_distance].to_s, at: [520, 534 - (index * 36)], width: 30, height: 14, align: :center
            else
              text_box attack[:range_distance].to_s, at: [520, 534 - (index * 36)], width: 30, height: 14, align: :center
            end

            damage = attack[:damage].include?('d') ? "#{attack[:damage]}#{'+' if attack[:damage_bonus].positive?}#{attack[:damage_bonus] unless attack[:damage_bonus].zero?}" : ((attack[:damage].to_i + attack[:damage_bonus]).positive? ? (attack[:damage].to_i + attack[:damage_bonus]).to_s : '-')
            text_box damage, at: [485, 534 - (index * 36)], width: 35, height: 14, align: :center
            # text_box attack[:damage_type], at: [520, 534 - (index * 36)], width: 30, height: 14, align: :center

            tags = attack[:tags].values
            tags.unshift(I18n.t('services.sheets_context.ready_to_use')) if attack[:ready_to_use]
            text_box tags.join(' / '), at: [327, 517 - (index * 36)], width: 200, height: 14
          end

          font_size 10
          text_box I18n.t('services.sheets_context.dnd.health'), at: [70, 659], width: 150, align: :center
          text_box I18n.t('services.sheets_context.dnd.saving_throws'), at: [346, 659], width: 175, align: :center
          text_box I18n.t('services.sheets_context.dnd.skills'), at: [70, 494], width: 150, align: :center
          text_box I18n.t('services.sheets_context.dnd.attacks'), at: [346, 564], width: 175, align: :center

          font_size 6
          text_box I18n.t('services.sheets_context.dnd.current_health').upcase, at: [30, 600], width: 70, align: :center
          text_box I18n.t('services.sheets_context.dnd.max_health').upcase, at: [110, 600], width: 70, align: :center
          text_box I18n.t('services.sheets_context.dnd.temp_health').upcase, at: [190, 600], width: 70, align: :center

          font_size 8
          text_box I18n.t('services.sheets_context.dnd.success'), at: [168, 576], width: 40
          text_box I18n.t('services.sheets_context.dnd.failure'), at: [168, 561], width: 40

          fill_color 'C6515C'
          character.death_saving_throws['success'].times do |index|
            fill_and_stroke_rounded_rectangle [222.5 + (index * 13), 578.5], 11, 11, 1
          end
          character.death_saving_throws['failure'].times do |index|
            fill_and_stroke_rounded_rectangle [222.5 + (index * 13), 563.5], 11, 11, 1
          end

          start_new_page

          font_size 10
          fill_color '000000'
          text_box I18n.t('services.sheets_context.equipment'), at: [210, 818], width: 175, align: :center

          font_size 6
          fill_color '444444'
          text_box I18n.t('services.sheets_context.count'), at: [242, 726], width: 40, height: 10, align: :center
          text_box I18n.t('services.sheets_context.count'), at: [509, 784], width: 40, height: 10, align: :center

          font_size 10
          fill_color '000000'
          character.parent.items.includes(:item)
            .to_a
            .sort_by { |item| item.item.name[I18n.locale.to_s] }
            .each_slice(25).to_a.each_with_index do |group, group_index|
              group.each_with_index do |item, index|
                text_box item.item.name[I18n.locale.to_s], at: [52 + (group_index * 267), 716 - (index * 28) + (group_index * 56)], width: 140, height: 14
                text_box item.states.values.sum.to_s, at: [242 + (group_index * 267), 716 - (index * 28) + (group_index * 56)], width: 40, height: 14, align: :center
              end
            end
        end
        # rubocop: enable Metrics/AbcSize, Layout/LineLength,  Metrics/MethodLength, Style/NestedTernaryOperator, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
      end
    end
  end
end
