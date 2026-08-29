# frozen_string_literal: true

module BotContextV2
  module Commands
    module Parsers
      class MakeCheck
        def call(arguments: []) # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
          result = {}
          parser = OptionParser.new do |act|
            act.on('--adv [TEXT]', Integer) { |text=0| result[:adv] = text.to_i }
            act.on('--advDice [TEXT]', String) { |text| result[:adv_dice] = text }
            act.on('--hopeDice [TEXT]', String) { |text| result[:hope_dice] = text }
            act.on('--fearDice [TEXT]', String) { |text| result[:fear_dice] = text }
            act.on('--dis [TEXT]', Integer) { |text=0| result[:adv] = text.to_i * -1 }
            act.on('--bonus [TEXT]', Integer) { |text=0| result[:bonus] = text.to_i }
            act.on('--penalty [TEXT]', Integer) { |text=0| result[:bonus] = text.to_i * -1 }
            act.on('--target [TEXT]', Integer) { |text=0| result[:target] = text.to_i }
            act.on('--expertise [TEXT]', Integer) { |text=0| result[:expertise] = text.to_i }
            act.on('--id [TEXT]', String) { |text| result[:id] = text }
            act.on('--dc [TEXT]', Integer) { |text| result[:dc] = text }
            act.on('--damage [TEXT]', Integer) { |text| result[:damage] = text }
            act.on('--crit [TEXT]') { |text| result[:crit] = text == 'true' }
            act.on('--miss [TEXT]') { |text| result[:miss] = text == 'true' }
            act.on('--critbonus [TEXT]', Integer) { |text=0| result[:critbonus] = text.to_i }
            act.on('--primarybonus [TEXT]', Integer) { |text=0| result[:primary_bonus] = text.to_i }
            act.on('--vicious [TEXT]') { |text| result[:vicious] = text == 'true' }
            act.on('--help [TEXT]', String) { |text| result[:help_dice] = text.downcase }
            act.on('--dices [TEXT]', String) { |text| result[:dices] = text.split(',') }
            act.on('--dicesBonus [TEXT]', Integer) { |text=0| result[:dices_bonus] = text.to_i }
            act.on('--deadly [TEXT]', String) { |text| result[:deadly] = text }
            act.on('--fatal [TEXT]', String) { |text| result[:fatal] = text }
          end
          parser.parse! arguments
          result
        end
      end
    end
  end
end
