# frozen_string_literal: true

module SheetsContext
  module Pdf
    module Dnd
      class Template < SheetsContext::Pdf::Template
        DIRECT_TIME_VALUES = %w[A BA R].freeze
        DIRECT_RANGE_VALUES = %w[self touch none].freeze
        DIRECT_DURATION_VALUES = %w[instant].freeze
        DIRECT_EFFECT_VALUES = %w[buff debuff heal].freeze

        # rubocop: disable Metrics/AbcSize, Layout/LineLength, Metrics/MethodLength, Style/NestedTernaryOperator, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
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
          text_box "#{'+' if character.initiative.positive?}#{character.initiative}", at: [104, 722], width: 37, height: 14, align: :center
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
            formatted_text_box [{ text: attack[:name], styles: attack[:ready_to_use] ? [:bold] : [], color: attack[:ready_to_use] ? '000000' : '444444' }], at: [327, 534 - (index * 36)], width: 100, height: 14

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

          render_equipment_page(character)

          %w[copper silver gold].each_with_index do |key, index|
            font_size 6
            fill_color 'FFFFFF'
            text_box I18n.t("services.sheets_context.gold.#{key}"), at: [80 + (index * 59), 759], width: 48, align: :center

            font_size 12
            fill_color '000000'
            text_box character.coins[key].to_s, at: [83 + (index * 59), 781], width: 42, height: 14, align: :center
          end

          start_new_page

          font_size 10
          fill_color '000000'
          text_box I18n.t('services.sheets_context.spells'), at: [210, 818], width: 175, align: :center

          font_size 8
          text_box I18n.t('services.sheets_context.slots'), at: [352, 784], width: 150, align: :center
          text_box '1', at: [313, 758], width: 10, align: :center
          text_box '2', at: [313, 740], width: 10, align: :center
          text_box '3', at: [313, 722], width: 10, align: :center
          text_box '4', at: [393, 758], width: 10, align: :center
          text_box '5', at: [393, 740], width: 10, align: :center
          text_box '6', at: [393, 722], width: 10, align: :center
          text_box '7', at: [473, 758], width: 10, align: :center
          text_box '8', at: [473, 740], width: 10, align: :center
          text_box '9', at: [473, 722], width: 10, align: :center

          character.spells_slots.each do |level, amount|
            x_start = level >= 7 ? 487 : (level >= 4 ? 407 : 327)
            y_start =
              case level
              when 1, 4, 7 then 759
              when 2, 5, 8 then 741
              when 3, 6, 9 then 723
              end

            amount.times do |index|
              fill_color character.spent_spell_slots[level.to_s].to_i >= index + 1 ? 'C6515C' : 'FFFFFF'
              fill_and_stroke_rounded_rectangle [x_start + (index * 13), y_start], 11, 11, 1
            end
          end

          if character.parent.is_a?(::Dnd2024::Character) # rubocop: disable Style/GuardClause
            font_size 4
            fill_color '444444'
            text_box I18n.t('services.sheets_context.dnd.spells.action').upcase, at: [222, 693], width: 40, height: 10, align: :center
            text_box I18n.t('services.sheets_context.dnd.spells.dist').upcase, at: [262, 693], width: 40, height: 10, align: :center
            text_box I18n.t('services.sheets_context.dnd.spells.hit').upcase, at: [302, 693], width: 40, height: 10, align: :center
            text_box I18n.t('services.sheets_context.dnd.spells.comp').upcase, at: [342, 693], width: 40, height: 10, align: :center
            text_box I18n.t('services.sheets_context.dnd.spells.duration').upcase, at: [382, 693], width: 40, height: 10, align: :center
            text_box I18n.t('services.sheets_context.dnd.spells.area').upcase, at: [422, 693], width: 40, height: 10, align: :center
            text_box I18n.t('services.sheets_context.dnd.spells.effects').upcase, at: [462, 693], width: 80, height: 10, align: :center

            fill_color '000000'
            spell_ids =
              character.parent
                .feats.includes(:feat)
                .where(feats: { origin: 6 }, ready_to_use: true)
                .pluck(:feat_id, :value).to_h

            # rubocop: disable Metrics/BlockLength
            ::Dnd2024::Feat.where(id: spell_ids.keys).or(::Dnd2024::Feat.where(origin: 6, slug: character.static_spells.keys))
              .sort_by { |item| [item.info['level'], item.title[I18n.locale.to_s]] }
              .each_with_index do |spell, index|
                static_data = character.static_spells[spell.slug] || {}
                prepared_by = spell_ids.dig(spell.id, 'prepared_by')&.to_sym

                font_size 6
                text_box spell.info['level'].to_s, at: [47, 679 - (index * 22)], width: 10, height: 14 if spell.info['level'].positive?

                font_size 8
                text_box spell.title[I18n.locale.to_s], at: [62, 681 - (index * 22)], width: 140, height: 14

                font_size 6
                values = []
                values << I18n.t('services.sheets_context.dnd.spells.concentration') if spell.info['concentration']
                values << I18n.t('services.sheets_context.dnd.spells.ritual') if spell.info['ritual']
                text_box values.join(' '), at: [202, 681 - (index * 22)], width: 15, height: 14, align: :right if values.any?

                text_box cast_time(spell.info['time']).to_s, at: [222, 681 - (index * 22)], width: 40, height: 14, align: :center
                text_box range(spell.info['range']).to_s, at: [262, 681 - (index * 22)], width: 40, height: 14, align: :center

                text_box components(spell.info['components']).to_s, at: [342, 681 - (index * 22)], width: 40, height: 14, align: :center
                text_box duration(spell.info['duration']).to_s, at: [382, 681 - (index * 22)], width: 40, height: 14, align: :center

                if spell.info['area']
                  text_box area(spell.info['area']).to_s, at: [422, 681 - (index * 22)], width: 40, height: 14, align: :center
                end

                if spell.info['hit'] && (character.spell_classes[prepared_by] || static_data['attack_bonus'])
                  value = static_data['attack_bonus'] || character.spell_classes.dig(prepared_by, :attack_bonus)

                  text_box "#{'+' if value.positive?}#{value}", at: [302, 681 - (index * 22)], width: 40, height: 14, align: :center
                end
                if spell.info['dc'] && (character.spell_classes[prepared_by] || static_data['save_dc'])
                  ability = ::Dnd2024::Character.abilities.dig(spell.info['dc'], 'shortName', I18n.locale.to_s)&.upcase

                  if ability
                    value = static_data['save_dc'] || character.spell_classes.dig(prepared_by, :save_dc)

                    text_box "#{ability} #{value}", at: [302, 681 - (index * 22)], width: 40, height: 14, align: :center
                  end
                end

                if spell.info['effects']
                  text_box effects(character, spell).to_s, at: [467, 681 - (index * 22)], width: 75, height: 14
                end
              end
            # rubocop: enable Metrics/BlockLength
          end
        end
        # rubocop: enable Metrics/AbcSize, Layout/LineLength, Metrics/MethodLength, Style/NestedTernaryOperator, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity

        private

        def cast_time(value)
          return I18n.t("services.sheets_context.dnd.actions.#{value}") if DIRECT_TIME_VALUES.include?(value)

          values = value.split(',')
          "#{values[0]} #{I18n.t("services.sheets_context.dnd.actions.#{values[1]}")}"
        end

        def range(value)
          return I18n.t("services.sheets_context.dnd.ranges.#{value}") if DIRECT_RANGE_VALUES.include?(value)

          values = value.split(',')
          "#{values[0]} #{I18n.t("services.sheets_context.dnd.ranges.#{values[1]}")}"
        end

        def components(value)
          value.split(',').map { |item| I18n.t("services.sheets_context.dnd.components.#{item}") }.join('/')
        end

        def duration(value)
          return I18n.t("services.sheets_context.dnd.durations.#{value}") if DIRECT_DURATION_VALUES.include?(value)

          values = value.split(',')
          "#{values[0]} #{I18n.t("services.sheets_context.dnd.durations.#{values[1]}")}"
        end

        def area(value)
          values = value.split(',')

          ([I18n.t("services.sheets_context.dnd.areas.#{values[0]}")] + values[1..]).join(' ')
        end

        # rubocop: disable Style/MethodCalledOnDoEndBlock
        def effects(character, spell)
          spell.info['effects'].map do |value|
            next I18n.t("services.sheets_context.dnd.effects.#{value}") if DIRECT_EFFECT_VALUES.include?(value)

            modifier = character.level >= 17 ? 4 : (character.level >= 11 ? 3 : (character.level >= 5 ? 2 : 1)) # rubocop: disable Style/NestedTernaryOperator
            damage_value = value.split(',').last
            damage_value.gsub!('1d', "#{modifier}d") if spell.info['damage_up']

            "#{I18n.t('services.sheets_context.dnd.effects.damage')} #{damage_value}"
          end.join(' / ')
        end
        # rubocop: enable Style/MethodCalledOnDoEndBlock
      end
    end
  end
end
