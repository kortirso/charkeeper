# frozen_string_literal: true

class ApplicationDecoratorV2
  include TranslateHelper
  include Deps[formula: 'formula', markdown: 'markdown']

  def method_missing(method, *_args)
    @result[method.to_s]
  end
end
