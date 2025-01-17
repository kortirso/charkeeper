# frozen_string_literal: true

module Dnd5
  class ClassDecorator
    extend Dry::Initializer

    option :decorator

    def decorate
      result = decorator.decorate

      # дополнить result
      result[:classes].each do |class_name, class_level|
        result = class_decorator(class_name).decorate(result: result, class_level: class_level)
      end
      modify_saving_throws(result)

      result
    end

    private

    def modify_saving_throws(result)
      result[:class_saving_throws].each do |class_saving_throw|
        result[:saving_throws][class_saving_throw] += result[:proficiency_bonus]
      end
    end

    def class_decorator(class_name)
      case class_name
      when 'barbarian' then Dnd5::Classes::BarbarianDecorator.new
      when 'fighter' then Dnd5::Classes::FighterDecorator.new
      when 'monk' then Dnd5::Classes::MonkDecorator.new
      end
    end
  end
end
